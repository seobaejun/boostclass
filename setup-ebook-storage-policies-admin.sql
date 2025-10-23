-- ebook-files Storage 버킷 관리자 정책 설정

-- 기존 정책들 삭제 (있다면)
DROP POLICY IF EXISTS "Admin can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;

-- 1. 관리자가 파일을 업로드할 수 있도록 허용
CREATE POLICY "Admin can upload ebook files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 2. 모든 사용자가 파일을 읽을 수 있도록 허용 (다운로드용)
CREATE POLICY "Anyone can view ebook files" ON storage.objects
FOR SELECT USING (bucket_id = 'ebook-files');

-- 3. 관리자가 파일을 삭제할 수 있도록 허용
CREATE POLICY "Admin can delete ebook files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 4. 관리자가 파일을 업데이트할 수 있도록 허용
CREATE POLICY "Admin can update ebook files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 정책 확인
SELECT 'ebook-files Storage 관리자 정책이 설정되었습니다!' as message;

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
