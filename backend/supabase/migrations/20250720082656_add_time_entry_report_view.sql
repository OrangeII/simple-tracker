set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.refresh_time_entry_report()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.time_entry_report;
  RETURN NULL;
END;
$function$
;

create materialized view "public"."time_entry_report" as  SELECT time_entries.user_id,
    time_entries.id AS time_entry_id,
    time_entries.notes AS time_entry_notes,
    time_entries.task_id,
    time_entries.start_time,
    time_entries.end_time,
    tasks.name AS task_name,
    tags.id AS tag_id,
    tags.name AS tag_name,
    tags.hex_color AS tag_color,
    tags.dot_text AS tag_dot_text,
    ((EXTRACT(epoch FROM (time_entries.end_time - time_entries.start_time)) * (1000)::numeric))::bigint AS duration,
    (EXTRACT(dow FROM time_entries.start_time))::integer AS weekday,
    (EXTRACT(month FROM time_entries.start_time))::integer AS month,
    (EXTRACT(year FROM time_entries.start_time))::integer AS year,
    1 AS count
   FROM (((time_entries
     LEFT JOIN tasks ON ((time_entries.task_id = tasks.id)))
     LEFT JOIN tasks_tags ON ((tasks_tags.task_id = tasks.id)))
     LEFT JOIN tags ON ((tasks_tags.tag_id = tags.id)))
  WHERE (time_entries.end_time IS NOT NULL);


CREATE INDEX idx_time_entry_report_start_time ON public.time_entry_report USING btree (start_time);

CREATE INDEX idx_time_entry_report_tag_id ON public.time_entry_report USING btree (tag_id);

CREATE INDEX idx_time_entry_report_task_id ON public.time_entry_report USING btree (task_id);

CREATE TRIGGER refresh_time_entry_report_trigger_tags AFTER INSERT OR DELETE OR UPDATE ON public.tags FOR EACH STATEMENT EXECUTE FUNCTION refresh_time_entry_report();

CREATE TRIGGER refresh_time_entry_report_trigger_tasks AFTER INSERT OR DELETE OR UPDATE ON public.tasks FOR EACH STATEMENT EXECUTE FUNCTION refresh_time_entry_report();

CREATE TRIGGER refresh_time_entry_report_trigger AFTER INSERT OR DELETE OR UPDATE ON public.time_entries FOR EACH STATEMENT EXECUTE FUNCTION refresh_time_entry_report();


