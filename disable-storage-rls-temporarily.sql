-- 임시로 Supabase Storage RLS 완전 비활성화 (테스트용)

-- storage.objects 테이블의 RLS 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- storage.buckets 테이블의 RLS 비활성화  
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- 확인 메시지
SELECT 'Supabase Storage RLS이 임시로 비활성화되었습니다!' as message;

-- 현재 RLS 상태 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS 활성화"
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename IN ('objects', 'buckets');
