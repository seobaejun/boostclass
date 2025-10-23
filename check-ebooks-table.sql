-- ebooks 테이블 존재 여부 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'ebooks';

-- ebooks 테이블 구조 확인 (테이블이 있다면)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ebooks'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ebooks 데이터 확인 (테이블이 있다면)
SELECT 
  id,
  title,
  author,
  status,
  is_free,
  created_at
FROM ebooks
ORDER BY created_at DESC
LIMIT 10;
