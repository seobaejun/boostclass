-- payment_key 컬럼의 NOT NULL 제약조건 제거
ALTER TABLE public.ebook_purchases 
ALTER COLUMN payment_key DROP NOT NULL;

-- currency 컬럼도 NULL 허용으로 변경 (필요시)
ALTER TABLE public.ebook_purchases 
ALTER COLUMN currency DROP NOT NULL;

-- 테이블 구조 확인
\d public.ebook_purchases;
