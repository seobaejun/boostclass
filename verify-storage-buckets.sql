-- Storage 버킷 및 정책 확인 스크립트

-- 1. 모든 이미지 관련 버킷 확인
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  file_size_limit as "파일크기제한(바이트)",
  allowed_mime_types as "허용MIME타입",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name IN (
  'course-thumbnails', 
  'course-images', 
  'ebook-thumbnails', 
  'ebook-details', 
  'ebook-files'
)
ORDER BY name;

-- 2. Storage RLS 정책 확인
SELECT 
  policyname as "정책명",
  cmd as "명령어",
  qual as "USING조건",
  with_check as "WITH CHECK조건"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND (policyname LIKE '%course%' OR policyname LIKE '%ebook%')
ORDER BY policyname;

-- 3. 각 버킷의 파일 개수 확인
SELECT 
  bucket_id as "버킷ID",
  COUNT(*) as "파일개수"
FROM storage.objects
WHERE bucket_id IN (
  'course-thumbnails', 
  'course-images', 
  'ebook-thumbnails', 
  'ebook-details', 
  'ebook-files'
)
GROUP BY bucket_id
ORDER BY bucket_id;

-- 완료 메시지
SELECT '✅ Storage 버킷 및 정책 확인 완료!' as message;

