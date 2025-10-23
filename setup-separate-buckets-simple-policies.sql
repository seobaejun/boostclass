-- 분리된 버킷들을 위한 간단한 RLS 정책 (문제 발생 시 사용)

-- 기존 정책들 모두 삭제
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

-- 모든 전자책 관련 버킷에 대해 모든 작업 허용 (개발/테스트용)
CREATE POLICY "Allow all operations on ebook buckets" ON storage.objects
FOR ALL 
USING (bucket_id IN ('ebook-thumbnails', 'ebook-details', 'ebook-files'))
WITH CHECK (bucket_id IN ('ebook-thumbnails', 'ebook-details', 'ebook-files'));

-- 정책 확인
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%ebook%';
