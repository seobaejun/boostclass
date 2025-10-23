-- 전자책 이미지 저장소 RLS 정책 설정
-- Supabase Dashboard > SQL Editor에서 실행

-- 기존 정책들 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Anyone can view ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage ebook images" ON storage.objects;

-- 1. 모든 사용자가 이미지를 볼 수 있도록 허용 (공개 읽기)
CREATE POLICY "Anyone can view ebook images" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('ebook-images', 'ebook-files')
);

-- 2. 인증된 사용자가 이미지를 업로드할 수 있도록 허용
CREATE POLICY "Authenticated users can upload ebook images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id IN ('ebook-images', 'ebook-files') 
  AND auth.role() = 'authenticated'
);

-- 3. 인증된 사용자가 자신이 업로드한 파일을 수정할 수 있도록 허용
CREATE POLICY "Authenticated users can update ebook images" ON storage.objects
FOR UPDATE USING (
  bucket_id IN ('ebook-images', 'ebook-files') 
  AND auth.role() = 'authenticated'
);

-- 4. 인증된 사용자가 파일을 삭제할 수 있도록 허용
CREATE POLICY "Authenticated users can delete ebook images" ON storage.objects
FOR DELETE USING (
  bucket_id IN ('ebook-images', 'ebook-files') 
  AND auth.role() = 'authenticated'
);

-- 5. 관리자 권한 확인 (선택사항 - 더 엄격한 권한이 필요한 경우)
-- CREATE POLICY "Admin can manage all ebook files" ON storage.objects
-- FOR ALL USING (
--   bucket_id IN ('ebook-images', 'ebook-files')
--   AND EXISTS (
--     SELECT 1 FROM user_profiles 
--     WHERE user_profiles.id = auth.uid() 
--     AND user_profiles.role = 'admin'
--   )
-- );

-- 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%ebook%'
ORDER BY policyname;
