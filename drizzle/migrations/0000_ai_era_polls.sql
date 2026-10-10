ALTER TABLE public.poll_votes ADD COLUMN IF NOT EXISTS poll_id text;
ALTER TABLE public.poll_votes ADD COLUMN IF NOT EXISTS option smallint CHECK (option BETWEEN 1 AND 3);
ALTER TABLE public.poll_votes ALTER COLUMN session_code SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.poll_votes ALTER COLUMN question_id SET DEFAULT 0;
ALTER TABLE public.poll_votes ALTER COLUMN choice SET DEFAULT 'n/a';
ALTER TABLE public.poll_votes ADD CONSTRAINT poll_votes_poll_voter_key UNIQUE (poll_id, voter_id);
COMMENT ON COLUMN public.poll_votes.session_code IS 'DEPRECATED: replaced by poll_id';
COMMENT ON COLUMN public.poll_votes.question_id IS 'DEPRECATED: replaced by poll_id';
COMMENT ON COLUMN public.poll_votes.choice IS 'DEPRECATED: replaced by option';
COMMENT ON TABLE public.poll_sessions IS 'DEPRECATED: old talk poll state';

GRANT SELECT, INSERT, UPDATE ON public.poll_votes TO anon, authenticated;
GRANT ALL ON public.poll_votes TO service_role;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai-era polls readable" ON public.poll_votes FOR SELECT TO anon, authenticated
  USING (poll_id IN ('s2-challenge','s7-interview'));
CREATE POLICY "ai-era polls insert" ON public.poll_votes FOR INSERT TO anon, authenticated
  WITH CHECK (poll_id IN ('s2-challenge','s7-interview') AND option BETWEEN 1 AND 3);
CREATE POLICY "ai-era polls update" ON public.poll_votes FOR UPDATE TO anon, authenticated
  USING (poll_id IN ('s2-challenge','s7-interview'))
  WITH CHECK (poll_id IN ('s2-challenge','s7-interview') AND option BETWEEN 1 AND 3);

ALTER TABLE public.poll_votes REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;