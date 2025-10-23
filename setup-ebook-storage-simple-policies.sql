-- ebook-files Storage 버킷 간단한 정책 설정 (모든 작업 허용)

-- 기존 정책들 모두 삭제
DROP POLICY IF EXISTS "Admin can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook files" ON storage.objects;

-- 모든 작업을 허용하는 단일 정책 (가장 간단함)
CREATE POLICY "Allow all operations on ebook files" ON storage.objects
FOR ALL 
USING (bucket_id = 'ebook-files')
WITH CHECK (bucket_id = 'ebook-files');

-- 정책 확인
SELECT 'ebook-files Storage 정책이 설정되었습니다! (모든 작업 허용)' as message;

-- 현재 정책 목록 확인
SELECT 
  policyname as "정책명",
  cmd as "작업",
  permissive as "허용여부",
  qual as "조건"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND qual LIKE '%ebook-files%'
ORDER BY policyname;
