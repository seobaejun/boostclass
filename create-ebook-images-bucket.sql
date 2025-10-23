-- 전자책 이미지 저장을 위한 버킷 생성
-- Supabase Dashboard > Storage에서 실행하거나 SQL Editor에서 실행

-- 1. 'ebook-images' 버킷 생성 (이미지 전용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-images', 'ebook-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 기존 'ebook-files' 버킷도 확인/생성 (PDF 파일용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-files', 'ebook-files', true)
ON CONFLICT (id) DO NOTHING;

-- 버킷 생성 확인
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE name IN ('ebook-images', 'ebook-files')
ORDER BY name;
