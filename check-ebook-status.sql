-- 현재 전자책 상태 확인
SELECT 
  id,
  title,
  author,
  status,
  is_free,
  price,
  download_count,
  created_at
FROM ebooks
ORDER BY created_at DESC;

-- 전자책을 published 상태로 변경 (필요시 실행)
-- UPDATE ebooks SET status = 'published' WHERE status = 'draft';
