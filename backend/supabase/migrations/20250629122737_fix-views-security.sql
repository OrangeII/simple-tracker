-- Create a view to summarize time entries by user and task
CREATE OR REPLACE VIEW task_stats WITH (security_invoker = on) AS
SELECT 
  user_id, 
  task_id, 
  sum(end_time - start_time) as total_time, 
  count(*) as entries_count
FROM 
  time_entries
GROUP BY 
  user_id, task_id;

-- Add a comment for the view
COMMENT ON VIEW task_stats IS 'Summarizes total time spent and count of entries per user per task';

-- Creating a view that aggregates task statistics by tag
CREATE OR REPLACE VIEW tag_stats WITH (security_invoker = on) AS
SELECT 
  tasks_tags.user_id, 
  tag_id,
  count(*) as tasks_count,
  sum(total_time) as total_time,
  sum(entries_count) as entries_count
FROM tasks_tags
JOIN tags ON tag_id = tags.id
JOIN tasks ON task_id = tasks.id
JOIN task_stats ON task_stats.user_id = tasks_tags.user_id AND task_stats.task_id = tasks_tags.task_id
GROUP BY tasks_tags.user_id, tag_id, tags.name;

-- Add comment to the view
COMMENT ON VIEW tag_stats IS 'Aggregated statistics of tasks by tag';