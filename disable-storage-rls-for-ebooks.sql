-- Storage RLS 완전 비활성화 (개발 환경용)
-- 주의: 프로덕션 환경에서는 사용하지 마세요!

-- 1. Storage 테이블의 RLS 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- 2. 기존 정책들 모두 삭제
DROP POLICY IF EXISTS "Anyone can view ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook files" ON storage.objects;

-- 3. RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename IN ('objects', 'buckets');

-- 참고: RLS를 다시 활성화하려면
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
