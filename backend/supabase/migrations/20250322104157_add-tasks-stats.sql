-- Create a view to summarize time entries by user and task
CREATE OR REPLACE VIEW task_stats AS
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