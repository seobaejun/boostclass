-- 권한 문제 해결을 위한 최소한의 정책만 생성
-- RLS 테이블 수정 없이 정책만 추가

-- 기존 정책들 삭제 (가능한 것만)
DROP POLICY IF EXISTS "Allow all operations on ebook buckets" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow all ebook operations" ON storage.objects;

-- 가장 간단한 정책 생성 (모든 작업 허용)
CREATE POLICY "Allow all ebook operations" ON storage.objects
FOR ALL 
TO public
USING (bucket_id IN ('ebook-files', 'ebook-thumbnails', 'ebook-details'))
WITH CHECK (bucket_id IN ('ebook-files', 'ebook-thumbnails', 'ebook-details'));

-- 정책 확인
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%ebook%';

-- 버킷 상태 확인
SELECT id, name, public 
FROM storage.buckets 
WHERE name IN ('ebook-files', 'ebook-thumbnails', 'ebook-details')
ORDER BY name;
