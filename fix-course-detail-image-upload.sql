-- 강의 상세 이미지 업로드 문제 해결

-- 1. 현재 Storage 버킷 상태 확인
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name IN ('course-thumbnails', 'course-images', 'ebook-thumbnails', 'ebook-details', 'ebook-files')
ORDER BY name;

-- 2. course-images 버킷 생성 (강의 상세 이미지용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. ebook-details 버킷 생성 (전자책 상세 이미지용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ebook-details',
  'ebook-details', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 4. course-thumbnails 버킷도 확인/생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 5. ebook-thumbnails 버킷도 확인/생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ebook-thumbnails',
  'ebook-thumbnails', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 6. Storage RLS 정책 설정: 강의 관련 버킷
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow all operations on course buckets" ON storage.objects;
DROP POLICY IF EXISTS "Public Access course-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload course-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update course-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete course-images" ON storage.objects;

-- 모든 강의 관련 버킷에 대해 모든 작업 허용 (개발/테스트용)
CREATE POLICY "Allow all operations on course buckets" ON storage.objects
FOR ALL 
USING (bucket_id IN ('course-thumbnails', 'course-images', 'course-videos'))
WITH CHECK (bucket_id IN ('course-thumbnails', 'course-images', 'course-videos'));

-- 7. Storage RLS 정책 설정: 전자책 관련 버킷
DROP POLICY IF EXISTS "Allow all operations on ebook buckets" ON storage.objects;

CREATE POLICY "Allow all operations on ebook buckets" ON storage.objects
FOR ALL 
USING (bucket_id IN ('ebook-thumbnails', 'ebook-details', 'ebook-files'))
WITH CHECK (bucket_id IN ('ebook-thumbnails', 'ebook-details', 'ebook-files'));

-- 8. 정책 확인
SELECT 
  policyname as "정책명",
  cmd as "명령어",
  qual as "조건"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND (policyname LIKE '%course%' OR policyname LIKE '%ebook%')
ORDER BY policyname;

-- 9. 최종 버킷 확인
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  file_size_limit as "파일크기제한",
  allowed_mime_types as "허용MIME타입",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name IN ('course-thumbnails', 'course-images', 'ebook-thumbnails', 'ebook-details', 'ebook-files')
ORDER BY name;

-- 완료 메시지
SELECT '✅ 강의 및 전자책 이미지 업로드를 위한 버킷과 정책 설정이 완료되었습니다!' as message;

