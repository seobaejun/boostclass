-- courses 테이블에 detail_image_url 컬럼 추가

-- 1. 현재 courses 테이블 구조 확인
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'courses'
  AND column_name IN ('thumbnail_url', 'detail_image_url')
ORDER BY column_name;

-- 2. detail_image_url 컬럼 추가
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS detail_image_url TEXT;

-- 3. 컬럼 설명 추가 (선택사항)
COMMENT ON COLUMN courses.detail_image_url IS '강의 상세 이미지 URL (상세페이지에서 표시)';

-- 4. 추가 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'courses'
  AND column_name IN ('thumbnail_url', 'detail_image_url')
ORDER BY column_name;

-- 5. 완료 메시지
SELECT '✅ courses 테이블에 detail_image_url 컬럼이 추가되었습니다!' as message;

