-- UUID 확장 활성화 (Supabase에서는 기본적으로 활성화되어 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- notices 테이블 생성
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' NOT NULL CHECK (priority IN ('normal', 'important')),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('published', 'draft', 'archived')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- RLS 비활성화 (테스트용)
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;

-- 테이블 생성 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notices'
ORDER BY ordinal_position;
