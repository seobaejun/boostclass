-- sprince1004@naver.com 관리자 권한 확인 및 설정

-- 1. auth.users 테이블에서 사용자 ID 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'sprince1004@naver.com';

-- 2. user_profiles 테이블에서 관리자 권한 확인
SELECT 
  up.id,
  up.email,
  up.name,
  up.full_name,
  up.role,
  up.is_active,
  up.created_at,
  up.updated_at,
  au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.email = 'sprince1004@naver.com' OR au.email = 'sprince1004@naver.com';

-- 3. user_profiles 테이블이 없거나 is_active 필드가 없으면 추가
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. 사용자가 user_profiles에 없으면 생성
-- (위 2번 쿼리에서 결과가 없을 경우에만 실행)
INSERT INTO user_profiles (id, email, name, full_name, role, is_active, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'sprince1004@naver.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = au.id
  );

-- 5. 관리자 권한 설정 (이미 있는 경우 업데이트)
UPDATE user_profiles
SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE email = 'sprince1004@naver.com';

-- 6. 최종 확인
SELECT 
  '✅ 관리자 권한 설정 완료' as status,
  up.id,
  up.email,
  up.role,
  up.is_active
FROM user_profiles up
WHERE up.email = 'sprince1004@naver.com';

