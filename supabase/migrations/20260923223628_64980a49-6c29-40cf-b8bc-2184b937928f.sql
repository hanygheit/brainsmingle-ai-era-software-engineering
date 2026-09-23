CREATE TABLE public.poll_sessions (
  session_code text PRIMARY KEY,
  is_open boolean NOT NULL DEFAULT true,
  version bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.poll_sessions TO anon, authenticated;
GRANT ALL ON public.poll_sessions TO service_role;
ALTER TABLE public.poll_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read poll session state" ON public.poll_sessions FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code text NOT NULL,
  question_id smallint NOT NULL CHECK (question_id BETWEEN 1 AND 4),
  choice text NOT NULL CHECK (choice IN ('allow','depends','block')),
  voter_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_code, question_id, voter_id)
);
GRANT ALL ON public.poll_votes TO service_role;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

INSERT INTO public.poll_sessions (session_code) VALUES ('cairo26');

CREATE OR REPLACE FUNCTION public.cast_vote(_session text, _question smallint, _choice text, _voter uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _question < 1 OR _question > 4 OR _choice NOT IN ('allow','depends','block') OR length(_session) > 40 THEN
    RAISE EXCEPTION 'invalid vote';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM poll_sessions WHERE session_code = _session AND is_open) THEN
    RAISE EXCEPTION 'poll closed';
  END IF;
  INSERT INTO poll_votes (session_code, question_id, choice, voter_id)
  VALUES (_session, _question, _choice, _voter)
  ON CONFLICT (session_code, question_id, voter_id) DO UPDATE SET choice = EXCLUDED.choice, created_at = now();
  UPDATE poll_sessions SET version = version + 1, updated_at = now() WHERE session_code = _session;
END $$;

CREATE OR REPLACE FUNCTION public.poll_results(_session text)
RETURNS TABLE (question_id smallint, choice text, votes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT question_id, choice, count(*) FROM poll_votes WHERE session_code = _session GROUP BY 1, 2
$$;

REVOKE ALL ON FUNCTION public.cast_vote(text, smallint, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.poll_results(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cast_vote(text, smallint, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.poll_results(text) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_sessions;