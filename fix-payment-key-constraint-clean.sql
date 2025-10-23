-- payment_key 컬럼의 NOT NULL 제약조건 제거
ALTER TABLE public.ebook_purchases 
ALTER COLUMN payment_key DROP NOT NULL;

-- currency 컬럼도 NULL 허용으로 변경 (필요시)
ALTER TABLE public.ebook_purchases 
ALTER COLUMN currency DROP NOT NULL;

-- 테이블 구조 확인 (Supabase용)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ebook_purchases' 
AND table_schema = 'public'
ORDER BY ordinal_position;
