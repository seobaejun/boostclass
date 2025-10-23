-- ebook-files 스토리지 정책 초기화 및 재생성

-- 1. 기존 정책들 삭제 (있다면)
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook files" ON storage.objects;

-- 2. 새로운 정책들 생성
-- 모든 사용자가 파일을 읽을 수 있도록 허용 (다운로드용)
CREATE POLICY "Anyone can view ebook files" ON storage.objects
FOR SELECT USING (bucket_id = 'ebook-files');

-- 인증된 사용자가 파일을 업로드할 수 있도록 허용
CREATE POLICY "Authenticated users can upload ebook files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 인증된 사용자가 파일을 삭제할 수 있도록 허용
CREATE POLICY "Authenticated users can delete ebook files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 인증된 사용자가 파일을 업데이트할 수 있도록 허용
CREATE POLICY "Authenticated users can update ebook files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 정책 확인
SELECT 'ebook-files 스토리지 정책이 재생성되었습니다!' as message;

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
