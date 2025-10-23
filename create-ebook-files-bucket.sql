-- ebook-files Storage 버킷 생성

-- 1. 버킷 생성 (public으로 설정)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ebook-files', 
  'ebook-files', 
  true,  -- public 버킷으로 설정
  52428800,  -- 50MB 제한
  ARRAY['application/pdf']  -- PDF 파일만 허용
)
ON CONFLICT (id) DO NOTHING;

-- 2. 버킷 생성 확인
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'ebook-files';

-- 3. 성공 메시지
SELECT 'ebook-files 버킷이 생성되었습니다!' as message;
