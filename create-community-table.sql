-- 커뮤니티 게시글 테이블 생성
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '정보공유',
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 게시글을 읽을 수 있음
CREATE POLICY "Anyone can read published community posts" ON community_posts
  FOR SELECT USING (status = 'published');

-- 로그인한 사용자만 게시글을 작성할 수 있음
CREATE POLICY "Authenticated users can create community posts" ON community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 작성자만 자신의 게시글을 수정할 수 있음
CREATE POLICY "Authors can update their own community posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- 작성자만 자신의 게시글을 삭제할 수 있음
CREATE POLICY "Authors can delete their own community posts" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
