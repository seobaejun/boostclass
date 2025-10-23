-- 업로드된 전자책들을 published 상태로 변경

-- 1. 현재 draft 상태인 전자책들을 published로 변경
UPDATE ebooks 
SET status = 'published', updated_at = NOW()
WHERE status = 'draft';

-- 2. 변경 결과 확인
SELECT id, title, status, updated_at
FROM ebooks 
ORDER BY updated_at DESC;

-- 3. 상태별 개수 재확인
SELECT status, COUNT(*) as count
FROM ebooks 
GROUP BY status;
