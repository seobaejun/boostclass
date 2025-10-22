-- 기존 community_posts 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
ORDER BY ordinal_position;

-- 테이블 데이터 확인
SELECT * FROM community_posts LIMIT 5;
