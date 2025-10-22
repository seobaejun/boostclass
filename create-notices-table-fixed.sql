-- 기존 notices 테이블 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS notices;

-- UUID 확장 활성화 (Supabase에서는 기본적으로 활성화되어 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- notices 테이블 생성 (개선된 버전)
CREATE TABLE notices (
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

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- RLS 비활성화 (테스트용)
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;

-- 테스트 데이터 삽입
INSERT INTO notices (title, content, priority, author_name, author_email, status) VALUES
('테스트 중요공지', '이것은 테스트용 중요 공지사항입니다.', 'important', 'Admin', 'admin@example.com', 'published'),
('테스트 일반공지', '이것은 테스트용 일반 공지사항입니다.', 'normal', 'Admin', 'admin@example.com', 'published');

-- 테이블 생성 확인
SELECT 'notices 테이블이 성공적으로 생성되었습니다!' as message;

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notices'
ORDER BY ordinal_position;

-- 테스트 데이터 확인
SELECT id, title, priority, author_name, created_at FROM notices;
