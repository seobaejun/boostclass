-- 업로드된 전자책 상태 확인

-- 1. 모든 전자책 데이터 확인
SELECT id, title, author, status, created_at, thumbnail_url, detail_image_url
FROM ebooks 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. 상태별 전자책 개수 확인
SELECT status, COUNT(*) as count
FROM ebooks 
GROUP BY status;

-- 3. 최근 업로드된 전자책의 상세 정보
SELECT *
FROM ebooks 
ORDER BY created_at DESC 
LIMIT 1;