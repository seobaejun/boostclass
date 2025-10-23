-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 전자책 구매 테이블 생성
CREATE TABLE IF NOT EXISTS public.ebook_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE NOT NULL,
  order_id TEXT NOT NULL UNIQUE, -- 토스페이먼츠 orderId
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KRW' NOT NULL,
  payment_key TEXT UNIQUE, -- 토스페이먼츠 paymentKey (결제 완료 후 설정)
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, completed, failed, cancelled
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  CONSTRAINT unique_user_ebook_purchase UNIQUE (user_id, ebook_id)
);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_user_id ON public.ebook_purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_ebook_id ON public.ebook_purchases (ebook_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_order_id ON public.ebook_purchases (order_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_status ON public.ebook_purchases (status);

-- RLS 활성화
ALTER TABLE public.ebook_purchases ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자가 자신의 구매 내역을 조회할 수 있도록 허용
DROP POLICY IF EXISTS "Users can view their own ebook purchases." ON public.ebook_purchases;
CREATE POLICY "Users can view their own ebook purchases." ON public.ebook_purchases
FOR SELECT USING (auth.uid() = user_id);

-- 정책: 인증된 사용자가 구매 내역을 생성할 수 있도록 허용 (결제 요청 시)
DROP POLICY IF EXISTS "Authenticated users can create ebook purchases." ON public.ebook_purchases;
CREATE POLICY "Authenticated users can create ebook purchases." ON public.ebook_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 정책: 인증된 사용자가 자신의 구매 내역을 업데이트할 수 있도록 허용 (결제 검증 시)
DROP POLICY IF EXISTS "Authenticated users can update their own ebook purchases." ON public.ebook_purchases;
CREATE POLICY "Authenticated users can update their own ebook purchases." ON public.ebook_purchases
FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE public.ebook_purchases IS '전자책 구매 내역 테이블';
COMMENT ON COLUMN public.ebook_purchases.order_id IS '토스페이먼츠 주문 ID (고유값)';
COMMENT ON COLUMN public.ebook_purchases.payment_key IS '토스페이먼츠 결제 키 (결제 완료 후 설정)';
COMMENT ON COLUMN public.ebook_purchases.amount IS '결제 금액';
COMMENT ON COLUMN public.ebook_purchases.status IS '결제 상태: pending, completed, failed, cancelled';
