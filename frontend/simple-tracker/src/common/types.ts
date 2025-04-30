export interface Task {
  id: string;
  name: string;
  alt_code?: string;
  created_at: string;
  user_id: string;
  is_favorite: boolean;
  tags?: Tag[];
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

export interface TaskStats {
  user_id: string;
  task_id: string;
  total_time: string;
  entries_count: number;
}

export interface TagStats {
  user_id: string;
  tag_id: string;
  tasks_count: number;
  total_time: string;
  entries_count: number;
}

export interface TimeInsightsWeeklyActivity {
  day: string;
  hours: number;
}

export interface TimeInsightsDailyPatterns {
  hour: string;
  activity: number;
}

export interface TaskTimeInfo {
  id: string;
  name: string;
  duration: number;
}

export interface TimeInsights {
  weekTotal: number;
  monthTotal: number;
  allTimeTotal: number;
  topWeeklyTasks: Array<TaskTimeInfo>;
  topMonthlyTasks: Array<TaskTimeInfo>;
  topAllTimeTasks: Array<TaskTimeInfo>;
  weeklyActivity: Array<TimeInsightsWeeklyActivity>;
  dailyPatterns: Array<TimeInsightsDailyPatterns>;
}
