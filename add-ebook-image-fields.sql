-- 전자책 테이블에 이미지 필드 추가
ALTER TABLE ebooks 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS detail_image_url TEXT;

-- 기존 cover_image 컬럼을 thumbnail_url로 사용 (필요시)
-- UPDATE ebooks SET thumbnail_url = cover_image WHERE cover_image IS NOT NULL;

-- 컬럼 설명 추가
COMMENT ON COLUMN ebooks.thumbnail_url IS '전자책 썸네일 이미지 URL (목록에서 표시)';
COMMENT ON COLUMN ebooks.detail_image_url IS '전자책 상세 이미지 URL (상세페이지에서 표시)';
