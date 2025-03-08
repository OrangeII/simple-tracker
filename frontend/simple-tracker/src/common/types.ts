export interface Task {
  id: string;
  name: string;
  alt_code?: string;
  created_at: string;
  user_id: string;
  is_favorite: boolean;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  created_at: string;
  tasks?: Task;
  loading?: boolean;
}

export interface CurrentTask {
  user_id: string;
  task_id: string;
  time_entry_id: string;
  tasks: Task;
  time_entries: TimeEntry;
}

export interface CurrentTasksRecord {
  user_id: string;
  task_id: string;
  time_entry_id: string;
  created_at: string;
}

export interface DateGroup {
  date: Date;
  totalTime: number;
  entries: TimeEntry[];
  entiresById: {
    [key: string]: TaskGroup;
  };
}

export interface TaskGroup {
  id: string;
  date: string;
  name: string;
  totalTime: number;
  entries: TimeEntry[];
}

export interface TrackParams {
  taskId?: string;
  altCode?: string;
  name?: string;
}

export interface Tag {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  hex_color?: string;
}
