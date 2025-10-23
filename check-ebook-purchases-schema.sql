-- ebook_purchases 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ebook_purchases' 
AND table_schema = 'public'
ORDER BY ordinal_position;
