-- ebook-files 스토리지 버킷의 RLS 정책 수정

-- 기존 정책들 삭제 (있다면)
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook files" ON storage.objects;

-- 임시로 RLS 비활성화 (테스트용)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 또는 모든 작업을 허용하는 정책 생성
CREATE POLICY "Allow all operations on ebook files" ON storage.objects
FOR ALL USING (bucket_id = 'ebook-files');

-- 정책 설정 확인
SELECT 'ebook-files 스토리지 RLS 정책이 수정되었습니다!' as message;

-- 현재 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
