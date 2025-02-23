import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../main.ts";
import type {
  CurrentTask,
  CurrentTasksRecord,
  Task,
  TimeEntry,
} from "./types.ts";

export const getCurrentTaskAndTimeEntry =
  async (): Promise<CurrentTask | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from("current_tasks")
        .select(
          `
        *,
        tasks (*),
        time_entries (*)
      `
        )
        .eq("user_id", user.id)
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
