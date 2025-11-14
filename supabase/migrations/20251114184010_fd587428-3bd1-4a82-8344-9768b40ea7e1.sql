-- Create audit log table for change tracking
CREATE TABLE IF NOT EXISTS public.change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'bulk_delete', 'bulk_update'
  table_name TEXT NOT NULL,
  record_id UUID,
  record_ids UUID[], -- For bulk operations
  previous_data JSONB, -- Store old data for undo
  new_data JSONB, -- Store new data
  metadata JSONB DEFAULT '{}', -- Additional context
  is_undone BOOLEAN DEFAULT false,
  undone_at TIMESTAMP WITH TIME ZONE,
  undone_by UUID REFERENCES auth.users(id),
  batch_id UUID -- Group related changes together
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_change_history_user_id ON public.change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_change_history_table_name ON public.change_history(table_name);
CREATE INDEX IF NOT EXISTS idx_change_history_created_at ON public.change_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_history_batch_id ON public.change_history(batch_id);
CREATE INDEX IF NOT EXISTS idx_change_history_is_undone ON public.change_history(is_undone) WHERE is_undone = false;

-- Enable RLS
ALTER TABLE public.change_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all changes
CREATE POLICY "Admins can view all change history" ON public.change_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert changes
CREATE POLICY "System can insert change history" ON public.change_history
  FOR INSERT
  WITH CHECK (true);

-- Admins can update undo status
CREATE POLICY "Admins can update undo status" ON public.change_history
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to log changes
CREATE OR REPLACE FUNCTION public.log_change(
  p_action_type TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_record_ids UUID[] DEFAULT NULL,
  p_previous_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_batch_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_change_id UUID;
BEGIN
  INSERT INTO public.change_history (
    user_id,
    action_type,
    table_name,
    record_id,
    record_ids,
    previous_data,
    new_data,
    metadata,
    batch_id
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_table_name,
    p_record_id,
    p_record_ids,
    p_previous_data,
    p_new_data,
    p_metadata,
    COALESCE(p_batch_id, gen_random_uuid())
  ) RETURNING id INTO v_change_id;
  
  RETURN v_change_id;
END;
$$;

-- Function to undo a change
CREATE OR REPLACE FUNCTION public.undo_change(p_change_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_change RECORD;
  v_success BOOLEAN := false;
BEGIN
  -- Get the change record
  SELECT * INTO v_change
  FROM public.change_history
  WHERE id = p_change_id
    AND is_undone = false
    AND has_role(auth.uid(), 'admin'::app_role);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Change not found or already undone';
  END IF;
  
  -- Undo based on action type
  CASE v_change.action_type
    WHEN 'delete' THEN
      -- Restore deleted record
      EXECUTE format(
        'INSERT INTO %I SELECT * FROM jsonb_populate_record(NULL::%I, $1)',
        v_change.table_name,
        v_change.table_name
      ) USING v_change.previous_data;
      v_success := true;
      
    WHEN 'bulk_delete' THEN
      -- Restore multiple deleted records
      IF v_change.previous_data IS NOT NULL THEN
        EXECUTE format(
          'INSERT INTO %I SELECT * FROM jsonb_populate_recordset(NULL::%I, $1)',
          v_change.table_name,
          v_change.table_name
        ) USING v_change.previous_data;
        v_success := true;
      END IF;
      
    WHEN 'update' THEN
      -- Restore previous values
      EXECUTE format(
        'UPDATE %I SET updated_at = now(), %s WHERE id = $1',
        v_change.table_name,
        (SELECT string_agg(
          format('%I = $2->>%L', key, key),
          ', '
        ) FROM jsonb_object_keys(v_change.previous_data) AS key)
      ) USING v_change.record_id, v_change.previous_data;
      v_success := true;
      
    WHEN 'bulk_update' THEN
      -- Not implemented for safety - complex to revert
      RAISE EXCEPTION 'Bulk update undo not supported';
      
    ELSE
      RAISE EXCEPTION 'Unknown action type: %', v_change.action_type;
  END CASE;
  
  -- Mark as undone
  IF v_success THEN
    UPDATE public.change_history
    SET is_undone = true,
        undone_at = now(),
        undone_by = auth.uid()
    WHERE id = p_change_id;
  END IF;
  
  RETURN v_success;
END;
$$;

COMMENT ON TABLE public.change_history IS 'Tracks all data changes for undo/redo functionality';
COMMENT ON FUNCTION public.log_change IS 'Logs a data change for potential undo';
COMMENT ON FUNCTION public.undo_change IS 'Undoes a previously logged change';