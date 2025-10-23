-- 기존 테이블 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS ebooks;

-- UUID 확장 활성화 (Supabase에서는 기본적으로 활성화되어 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ebooks 테이블 생성
CREATE TABLE ebooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT DEFAULT 'PDF',
  file_path TEXT, -- PDF 파일 경로
  download_count INTEGER DEFAULT 0,
  price INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_ebooks_status ON ebooks(status);
CREATE INDEX IF NOT EXISTS idx_ebooks_category ON ebooks(category);
CREATE INDEX IF NOT EXISTS idx_ebooks_author ON ebooks(author);
CREATE INDEX IF NOT EXISTS idx_ebooks_created_at ON ebooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ebooks_featured ON ebooks(featured);
CREATE INDEX IF NOT EXISTS idx_ebooks_is_free ON ebooks(is_free);

-- RLS 비활성화 (테스트용)
ALTER TABLE ebooks DISABLE ROW LEVEL SECURITY;

-- 테이블 생성 확인
SELECT 'ebooks 테이블이 성공적으로 생성되었습니다!' as message;
