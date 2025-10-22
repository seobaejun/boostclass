-- 간단한 댓글 테이블 생성 (RLS 없이)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_id UUID,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- RLS 비활성화 (개발 단계에서 간단하게)
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- 테이블 생성 확인
SELECT 'comments 테이블이 생성되었습니다.' as message;
