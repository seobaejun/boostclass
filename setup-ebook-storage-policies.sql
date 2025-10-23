-- ebook-files 스토리지 버킷에 대한 정책 설정

-- 1. 모든 사용자가 파일을 읽을 수 있도록 허용 (다운로드용)
CREATE POLICY "Anyone can view ebook files" ON storage.objects
FOR SELECT USING (bucket_id = 'ebook-files');

-- 2. 인증된 사용자가 파일을 업로드할 수 있도록 허용
CREATE POLICY "Authenticated users can upload ebook files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 3. 인증된 사용자가 파일을 삭제할 수 있도록 허용
CREATE POLICY "Authenticated users can delete ebook files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 4. 인증된 사용자가 파일을 업데이트할 수 있도록 허용
CREATE POLICY "Authenticated users can update ebook files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ebook-files' 
  AND auth.role() = 'authenticated'
);

-- 정책 설정 확인
SELECT 'ebook-files 스토리지 정책이 성공적으로 설정되었습니다!' as message;
