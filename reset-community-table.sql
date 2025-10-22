-- 모든 community_posts 관련 테이블 삭제
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;

-- 혹시 다른 스키마에 있을 수도 있으니 확인
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename LIKE '%community%';

-- 새로운 community_posts 테이블 생성
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT '정보공유' NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_id UUID,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'published' NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX idx_community_posts_status ON community_posts(status);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);

-- 테이블 생성 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
ORDER BY ordinal_position;
