-- ebook-files 스토리지 버킷 생성 및 정책 설정

-- 1. 버킷이 없다면 생성 (Supabase 대시보드에서 수동으로 해야 할 수도 있음)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ebook-files', 'ebook-files', false);

-- 2. 버킷 정책 설정 (이것은 작동해야 함)
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
SELECT 'ebook-files 스토리지 정책이 생성되었습니다!' as message;
