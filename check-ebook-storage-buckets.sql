-- 전자책 스토리지 버킷 확인 및 생성

-- 1. 현재 존재하는 전자책 관련 버킷 확인
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name IN ('ebook-thumbnails', 'ebook-details', 'ebook-files')
ORDER BY name;

-- 2. 버킷이 없으면 생성
-- 2-1. 'ebook-thumbnails' 버킷 생성 (썸네일 이미지 전용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-thumbnails', 'ebook-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2-2. 'ebook-details' 버킷 생성 (상세 이미지 전용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-details', 'ebook-details', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2-3. 'ebook-files' 버킷 생성 (PDF 파일용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-files', 'ebook-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. 다시 확인
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name IN ('ebook-thumbnails', 'ebook-details', 'ebook-files')
ORDER BY name;

-- 4. Storage 정책 확인
SELECT 
  policyname as "정책명",
  cmd as "명령어",
  qual as "조건"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%ebook%'
ORDER BY policyname;

