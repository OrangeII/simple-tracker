-- add a unique index so view can be updated concurrently
CREATE UNIQUE INDEX IF NOT EXISTS idx_time_entry_report_time_entry_id_tag_id ON public.time_entry_report USING btree (time_entry_id, tag_id);    

-- Create a private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Move the materialized view to the private schema
ALTER MATERIALIZED VIEW public.time_entry_report SET SCHEMA private;

-- Create a public view with RLS
CREATE OR REPLACE VIEW public.time_entry_report 
WITH (security_invoker=on) AS 
SELECT * FROM private.time_entry_report
WHERE (select auth.uid()) = user_id;
