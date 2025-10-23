-- RLS 정책 오류 해결을 위한 간단한 정책 적용

-- 1. 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook buckets" ON storage.objects;

-- 2. 모든 전자책 버킷에 대해 모든 작업 허용 (개발용)
CREATE POLICY "Allow all operations on ebook buckets" ON storage.objects
FOR ALL 
USING (bucket_id IN ('ebook-files', 'ebook-thumbnails', 'ebook-details'))
WITH CHECK (bucket_id IN ('ebook-files', 'ebook-thumbnails', 'ebook-details'));

-- 3. 정책 확인
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%ebook%';

-- 4. 버킷 상태 확인
SELECT id, name, public 
FROM storage.buckets 
WHERE name IN ('ebook-files', 'ebook-thumbnails', 'ebook-details')
ORDER BY name;
