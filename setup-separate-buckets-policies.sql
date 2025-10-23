-- 분리된 전자책 이미지 버킷들을 위한 RLS 정책

-- 기존 정책들 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Anyone can view ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook files" ON storage.objects;

-- 1. 썸네일 버킷 정책
CREATE POLICY "Anyone can view ebook thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'ebook-thumbnails');

CREATE POLICY "Authenticated users can upload ebook thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ebook-thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update ebook thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ebook-thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete ebook thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ebook-thumbnails' 
  AND auth.role() = 'authenticated'
);

-- 2. 상세 이미지 버킷 정책
CREATE POLICY "Anyone can view ebook details" ON storage.objects
FOR SELECT USING (bucket_id = 'ebook-details');

CREATE POLICY "Authenticated users can upload ebook details" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ebook-details' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update ebook details" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ebook-details' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete ebook details" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ebook-details' 
  AND auth.role() = 'authenticated'
);

-- 3. PDF 파일 버킷 정책 (기존 유지)
CREATE POLICY "Anyone can view ebook files" ON storage.objects
FOR SELECT USING (bucket_id = 'ebook-files');

CREATE POLICY "Authenticated users can upload ebook files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete ebook files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 정책 확인
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%ebook%'
ORDER BY policyname;
