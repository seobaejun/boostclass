-- 전자책 이미지 저장소 간단한 RLS 정책
-- 복잡한 정책에서 문제가 발생할 경우 사용

-- 기존 정책들 모두 삭제
DROP POLICY IF EXISTS "Anyone can view ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook files" ON storage.objects;

-- 모든 작업을 허용하는 단일 정책 (개발/테스트용)
CREATE POLICY "Allow all operations on ebook files" ON storage.objects
FOR ALL 
USING (bucket_id IN ('ebook-images', 'ebook-files'))
WITH CHECK (bucket_id IN ('ebook-images', 'ebook-files'));

-- 정책 확인
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%ebook%';
