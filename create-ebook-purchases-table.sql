-- 전자책 구매 테이블 생성
CREATE TABLE IF NOT EXISTS ebook_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ebook_id UUID NOT NULL,
  payment_key TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
  payment_method TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_user_id ON ebook_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_ebook_id ON ebook_purchases(ebook_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_order_id ON ebook_purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_status ON ebook_purchases(status);

-- RLS 정책 설정
ALTER TABLE ebook_purchases ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 구매 내역만 볼 수 있음
CREATE POLICY "Users can view own purchases" ON ebook_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 구매 내역만 생성할 수 있음
CREATE POLICY "Users can create own purchases" ON ebook_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 구매 내역을 볼 수 있음 (선택사항)
-- CREATE POLICY "Admins can view all purchases" ON ebook_purchases
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM user_profiles 
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );

COMMENT ON TABLE ebook_purchases IS '전자책 구매 내역 테이블';
COMMENT ON COLUMN ebook_purchases.payment_key IS '토스 페이먼츠 결제 키';
COMMENT ON COLUMN ebook_purchases.order_id IS '주문 ID (고유값)';
COMMENT ON COLUMN ebook_purchases.amount IS '결제 금액 (원)';
COMMENT ON COLUMN ebook_purchases.status IS '결제 상태: pending, completed, failed, cancelled';
