-- 전자책 상세 이미지 저장소(ebook-details) 버킷 생성 및 설정

-- 1. 기존 버킷 확인
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name = 'ebook-details';

-- 2. ebook-details 버킷 생성 (상세 이미지 전용, 공개)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-details', 'ebook-details', true)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  name = 'ebook-details';

-- 3. 버킷 생성 확인
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name = 'ebook-details';

-- 4. 관련 버킷도 함께 확인 (ebook-thumbnails, ebook-files)
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name IN ('ebook-thumbnails', 'ebook-details', 'ebook-files')
ORDER BY name;

-- 5. Storage 정책 설정 (없으면 생성)
DROP POLICY IF EXISTS "Allow all operations on ebook buckets" ON storage.objects;

-- 모든 전자책 관련 버킷에 대해 모든 작업 허용 (개발/테스트용)
CREATE POLICY "Allow all operations on ebook buckets" ON storage.objects
FOR ALL 
USING (bucket_id IN ('ebook-thumbnails', 'ebook-details', 'ebook-files'))
WITH CHECK (bucket_id IN ('ebook-thumbnails', 'ebook-details', 'ebook-files'));

-- 6. 정책 확인
SELECT 
  policyname as "정책명",
  cmd as "명령어"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%ebook%'
ORDER BY policyname;

-- 완료 메시지
SELECT '✅ ebook-details 버킷 및 정책 설정이 완료되었습니다!' as message;

