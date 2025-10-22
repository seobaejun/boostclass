-- 첫 번째 게시글을 draft 상태로 변경
UPDATE community_posts 
SET status = 'draft' 
WHERE id = '100d67a1-26c1-44f9-bf79-1d5ff703c3c6';

-- 두 번째 게시글을 pending 상태로 변경  
UPDATE community_posts 
SET status = 'pending'
WHERE id = '766e1f91-16eb-4097-a981-26de448b0d2e';

-- 상태별 게시글 수 확인
SELECT status, COUNT(*) as count
FROM community_posts 
GROUP BY status;

-- 모든 게시글 상태 확인
SELECT id, title, status, created_at
FROM community_posts 
ORDER BY created_at DESC;
