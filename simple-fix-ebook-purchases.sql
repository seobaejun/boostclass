-- 간단한 해결책: payment_key 기본값 설정
ALTER TABLE public.ebook_purchases 
ALTER COLUMN payment_key SET DEFAULT '';

-- 또는 NOT NULL 제약조건 제거
ALTER TABLE public.ebook_purchases 
ALTER COLUMN payment_key DROP NOT NULL;
