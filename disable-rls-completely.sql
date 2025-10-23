-- RLS 완전 비활성화 (개발 환경용)
-- 주의: 프로덕션에서는 사용하지 마세요!

-- 1. Storage 테이블의 RLS 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- 2. 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Allow all operations on ebook buckets" ON storage.objects;

-- 3. RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename IN ('objects', 'buckets');

-- 4. 버킷 상태 확인
SELECT id, name, public 
FROM storage.buckets 
WHERE name IN ('ebook-files', 'ebook-thumbnails', 'ebook-details')
ORDER BY name;
