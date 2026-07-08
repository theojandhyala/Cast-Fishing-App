-- Live fishing sessions that friends can be invited to and join in real time.
CREATE TABLE IF NOT EXISTS live_sessions (
  id          TEXT PRIMARY KEY,
  host_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_name   TEXT NOT NULL,
  latitude    REAL,
  longitude   REAL,
  start_time  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active', -- active | ended
  created_at  TEXT NOT NULL,
  ended_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_host ON live_sessions(host_id, status);

-- One row per participant (host included). status: invited | joined | declined.
CREATE TABLE IF NOT EXISTS live_session_participants (
  session_id  TEXT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'guest', -- host | guest
  status      TEXT NOT NULL DEFAULT 'invited',
  invited_by  TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lsp_user ON live_session_participants(user_id, status);
