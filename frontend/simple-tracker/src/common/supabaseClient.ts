import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../main.ts";
import type {
  CurrentTask,
  CurrentTasksRecord,
  Tag,
  TagStats,
  Task,
  TaskStats,
  TimeEntry,
} from "./types.ts";
import { generateRandomColor } from "./colorUtils.ts";

export const getCurrentTaskAndTimeEntry =
  async (): Promise<CurrentTask | null> => {
    try {
      const { data, error } = await supabase
        .from("current_tasks")
        .select(
          `
        *,
        tasks (*),
        time_entries (*)
      `
        )
        .maybeSingle();

      if (error) {
        console.error("Error fetching current task and time entry:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getCurrentTaskAndTimeEntry:", error);
      return null;
    }
  };

export const stopCurrentTracking = async (): Promise<boolean> => {
  try {
    const currentTracking = await getCurrentTaskAndTimeEntry();
    if (!currentTracking) return false;

    //set end time to time entry
    const endTime = new Date();
    let { error } = await supabase
      .from("time_entries")
      .update({ end_time: endTime })
      .eq("id", currentTracking.time_entries.id);
    if (error) {
      console.error("error setting end time to time entry:", error);
      return false;
    }

    //remove current tracking from user
    ({ error } = await supabase
      .from("current_tasks")
      .delete()
      .eq("user_id", currentTracking.user_id));
    if (error) {
      console.error("error deleting current task tracking for user:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in stopCurrentTracking:", error);
    return false;
  }
};

export const createTask = async (
  name: string,
  altCode?: string
): Promise<Task | null> => {
  try {
    let { data: createdTask, error } = await supabase
      .from("tasks")
      .insert({
        name: name,
        alt_code: altCode,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting new task:", error);
      return null;
    }

    //if the alt code was not provided, set it equal to the id
    if (!createdTask.alt_code) {
      const { data: updatedData } = await supabase
        .from("tasks")
        .update({ alt_code: createdTask.id })
        .eq("id", createdTask.id)
        .select()
        .single();
      createdTask = updatedData;
    }

    return createdTask;
  } catch (error) {
    console.error("Error in createTask:", error);
    return null;
  }
};

export const startTracking = async (
  taskId: string,
  startTime: Date
): Promise<TimeEntry | null> => {
  try {
    //set the current task for the user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    //start a new time entry for the created task
    const { data: createdTimeEntry, error: entryError } = await supabase
      .from("time_entries")
      .insert({ task_id: taskId, start_time: startTime })
      .select()
      .single();

    if (entryError) {
      console.error("Error inserting new time entry:", entryError);
      return null;
    }

    const { error } = await supabase.from("current_tasks").upsert({
      user_id: user.id,
      task_id: taskId,
      time_entry_id: createdTimeEntry.id,
    });
    if (error) {
      console.error("error setting current task and entry:", error);
      return null;
    }

    return createdTimeEntry;
  } catch (error) {
    console.error("Error in startTracking:", error);
    return null;
  }
};

export const getEntries = async (
  limit: number,
  page: number
): Promise<TimeEntry[] | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    //fetch ended time entries for the user in descending order
    const { data, error } = await supabase
      .from("time_entries")
      .select(
        `
      *, 
      tasks (*)
      `
      )
      .eq("user_id", user.id)
      .not("end_time", "is", null)
      .order("created_at", { ascending: false })
      .range(limit * page, limit * (page + 1) - 1);

    if (error) {
      console.error("Error fetching entries", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getEntries:", error);
    return null;
  }
};

export const getTaskByAltCode = async (
  altCode: string
): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select()
      .eq("alt_code", altCode)
      .maybeSingle();

    if (error) {
      console.error(error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getTaskByAltCode:", error);
    return null;
  }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getTaskById:", error);
    return null;
  }
};

export const track = async (params: {
  taskId?: string;
  altCode?: string;
  name?: string;
  startTime: Date;
}): Promise<CurrentTask | null> => {
  try {
    let task;

    if (params.taskId) {
      //start tracking task by id
      task = await getTaskById(params.taskId);
    } else if (params.altCode) {
      //start tracking task by altCode
      task = await getTaskByAltCode(params.altCode);
      if (!task) {
        if (!params.name) params.name = params.altCode;
        //make a new task if not found
        task = await createTask(params.name, params.altCode);
      }
    } else if (params.name) {
      //make new task
      task = await createTask(params.name, params.altCode);
    } else {
      //can't do anything
      return null;
    }

    if (!task) {
      return null;
    }

    await stopCurrentTracking();

    const timeEntry = await startTracking(task.id, params.startTime);
    if (!timeEntry) {
      return null;
    }

    const created: CurrentTask = {
      user_id: timeEntry.user_id,
      task_id: timeEntry.task_id,
      time_entry_id: timeEntry.id,
      time_entries: timeEntry,
      tasks: task,
    };

    return created;
  } catch (error) {
    console.error("Error in track:", error);
    return null;
  }
};

/**
 * create a subscription to events on the current_tasks table
 * @param callback a function that will be called each time a change occurs
 * @returns a subscription object that can be used to unsubscribe
 */
export const subscribeToCurrentTasks = async (
  callback: (payload: {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    newRecord: CurrentTasksRecord;
    oldRecord: CurrentTasksRecord;
  }) => void
): Promise<RealtimeChannel | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    //create subscription to supabase realtime
    const subscription = supabase
      .channel("current_tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "current_tasks",
          filter: "user_id=eq." + user.id,
        },
        (payload) => {
          callback({
            eventType: payload.eventType,
            newRecord: payload.new as CurrentTasksRecord,
            oldRecord: payload.old as CurrentTasksRecord,
          });
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error("Error in subscribeToCurrentTasks:", error);
    return null;
  }
};

export const unsubscribeFromCurrentTasks = async (
  subscription: RealtimeChannel
) => {
  try {
    supabase.removeChannel(subscription);
  } catch (error) {
    console.error("Error in unsubscribeFromCurrentTasks:", error);
  }
};

export const deleteEntry = async (entryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", entryId);
    if (error) {
      console.error("Error deleting entry:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteEntry:", error);
    return false;
  }
};

/**
 * update the time entry on the database
 * @param entry entry to be updated
 * @returns
 */
export const updateEntry = async (entry: TimeEntry): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("time_entries")
      .update({
        start_time: entry.start_time,
        end_time: entry.end_time,
      })
      .eq("id", entry.id);
    if (error) {
      console.error("Error updating entry:", error);
      return false;
    }

    if (entry.tasks) {
      await updateTask(entry.tasks);
    }

    return true;
  } catch (error) {
    console.error("Error in updateEntry:", error);
    return false;
  }
};

/**
 * update the task on the database
 * @param task task to be updated
 * @returns
 */
export const updateTask = async (task: Task): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({
        name: task.name.trim(),
        alt_code: task.alt_code?.trim(),
        is_favorite: task.is_favorite,
      })
      .eq("id", task.id);
    if (error) {
      console.error("Error updating task:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateTask:", error);
    return false;
  }
};

export const updateTag = async (tag: Tag): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tags")
      .update({
        name: tag.name.trim(),
        hex_color: tag.hex_color,
      })
      .eq("id", tag.id);

    if (error) {
      console.error("Error updating tag:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in updateTag:", error);
    return false;
  }
};

export const getFavorites = async (): Promise<Task[] | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select()
      .eq("is_favorite", true)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error retrieving favorites:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getFavorites:", error);
    return null;
  }
};

export const getTags = async (): Promise<Tag[] | null> => {
  try {
    const { data, error } = await supabase.from("tags").select("*");
    if (error) {
      console.error("Error fetching tags:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in getTags:", error);
    return null;
  }
};

export const createTag = async (
  name: string,
  color?: string
): Promise<Tag | null> => {
  try {
    name = name.toLowerCase().trim();

    if (!color) {
      color = generateRandomColor();
    }

    const { data, error } = await supabase
      .from("tags")
      .insert({ name, hex_color: color })
      .select()
      .single();
    if (error) {
      console.error("Error creating tag:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in createTag:", error);
    return null;
  }
};

export const deleteTag = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) {
      console.error("Error deleting tag:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteTag:", error);
    return false;
  }
};

export const getTaskTags = async (taskId: string): Promise<Tag[] | null> => {
  try {
    const { data, error } = await supabase
      .from("tasks_tags")
      .select("tag_id")
      .eq("task_id", taskId);

    if (error) {
      console.error("Error fetching task tags:", error);
      return null;
    }

    const tagIds = data.map((t) => t.tag_id);
    const { data: tagsData, error: error2 } = await supabase
      .from("tags")
      .select()
      .in("id", tagIds);

    if (error2) {
      console.error("Error fetching tags:", error);
      return null;
    }

    return tagsData;
  } catch (error) {
    console.error("Error in getTaskTags:", error);
    return null;
  }
};

export const addTagToTask = async (
  taskId: string,
  tagId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tasks_tags")
      .insert({ task_id: taskId, tag_id: tagId });

    if (error) {
      console.error("Error adding tag to task:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in addTagToTask:", error);
    return false;
  }
};

export const removeTagFromTask = async (
  taskId: string,
  tagId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tasks_tags")
      .delete()
      .match({ task_id: taskId, tag_id: tagId });

    if (error) {
      console.error("Error removing tag from task:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in removeTagFromTask:", error);
    return false;
  }
};

export const getTasks = async (): Promise<Task[] | null> => {
  try {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) {
      console.error("Error fetching tasks:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in getTasks:", error);
    return null;
  }
};

export const getTaskStats = async (
  taskId: string
): Promise<TaskStats | null> => {
  try {
    const { data, error } = await supabase
      .from("task_stats")
      .select("*")
      .eq("task_id", taskId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching task stats:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getTaskStats:", error);
    return null;
  }
};

export const getTagStats = async (tagId: string): Promise<TagStats | null> => {
  try {
    const { data, error } = await supabase
      .from("tag_stats")
      .select("*")
      .eq("tag_id", tagId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching tag stats:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getTagStats:", error);
    return null;
  }
};
