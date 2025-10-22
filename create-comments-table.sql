-- comments 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 댓글을 읽을 수 있도록 허용
CREATE POLICY "Allow public read access" ON comments
FOR SELECT USING (TRUE);

-- 로그인한 사용자가 댓글을 생성할 수 있도록 허용
CREATE POLICY "Allow authenticated users to create comments" ON comments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 작성자만 자신의 댓글을 업데이트할 수 있도록 허용
CREATE POLICY "Allow owners to update their own comments" ON comments
FOR UPDATE USING (auth.uid()::text = author_id::text);

-- 작성자만 자신의 댓글을 삭제할 수 있도록 허용
CREATE POLICY "Allow owners to delete their own comments" ON comments
FOR DELETE USING (auth.uid()::text = author_id::text);

-- 'updated_at' 컬럼 자동 업데이트를 위한 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 테이블 생성 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;
