-- sprince1004@naver.com 사용자 관리자 권한 확인

-- 1. auth.users 테이블에서 사용자 찾기
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'sprince1004@naver.com';

-- 2. user_profiles 테이블에서 사용자 프로필 확인
SELECT 
  up.id,
  up.email,
  up.name,
  up.full_name,
  up.role,
  up.created_at,
  up.updated_at,
  au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.email = 'sprince1004@naver.com' OR au.email = 'sprince1004@naver.com';

-- 3. is_active 필드가 없으면 추가 (마이그레이션 후)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. 관리자 권한이 없으면 관리자로 설정하는 SQL (필요시 실행)
UPDATE user_profiles
SET role = 'admin', is_active = true
WHERE email = 'sprince1004@naver.com';

