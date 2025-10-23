-- 썸네일과 상세 이미지를 위한 별도 버킷 생성

-- 1. 썸네일 전용 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-thumbnails', 'ebook-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 상세 이미지 전용 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-details', 'ebook-details', true)
ON CONFLICT (id) DO NOTHING;

-- 3. 기존 PDF 파일 버킷 (유지)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-files', 'ebook-files', true)
ON CONFLICT (id) DO NOTHING;

-- 버킷 생성 확인
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE name IN ('ebook-thumbnails', 'ebook-details', 'ebook-files')
ORDER BY name;
