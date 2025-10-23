-- 모든 전자책 관련 Storage 정책 초기화
-- 기존 정책들을 모두 삭제한 후 새로 생성

-- 1. 기존 모든 전자책 관련 정책 삭제
DROP POLICY IF EXISTS "Anyone can view ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can update ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook details" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can delete ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook files" ON storage.objects;

DROP POLICY IF EXISTS "Allow all operations on ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook buckets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage ebook images" ON storage.objects;

-- 2. 현재 남아있는 전자책 관련 정책 확인
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND (policyname LIKE '%ebook%' OR policyname LIKE '%Ebook%')
ORDER BY policyname;

-- 3. 정책 삭제 완료 메시지
SELECT '모든 전자책 관련 Storage 정책이 삭제되었습니다. 이제 새로운 정책을 생성할 수 있습니다.' as message;
