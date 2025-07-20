CREATE OR REPLACE FUNCTION public.refresh_time_entry_report()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.time_entry_report;
  RETURN NULL;
END;
$function$
;

-- move the function to the private schema
ALTER FUNCTION public.refresh_time_entry_report SET SCHEMA private;