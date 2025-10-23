-- 전자책 상태를 draft에서 published로 변경

-- 1. 현재 상태 확인
SELECT 
  id,
  title,
  author,
  status,
  is_free,
  created_at
FROM ebooks 
ORDER BY created_at DESC;

-- 2. 모든 draft 상태를 published로 변경
UPDATE ebooks 
SET status = 'published' 
WHERE status = 'draft';

-- 3. 변경 결과 확인
SELECT 
  id,
  title,
  status,
  '✅ 변경 완료' as result
FROM ebooks 
ORDER BY created_at DESC;

-- 4. 상태별 개수 확인
SELECT 
  status,
  COUNT(*) as count
FROM ebooks 
GROUP BY status;
