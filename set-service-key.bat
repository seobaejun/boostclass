@echo off
echo Supabase 서비스 키를 설정합니다.
echo.
echo 1. Supabase 대시보드에서 Settings > API로 이동
echo 2. service_role 키를 복사하세요 (매우 긴 JWT 토큰)
echo 3. 아래에 붙여넣고 Enter를 누르세요:
echo.
set /p SERVICE_KEY="서비스 키 입력: "
echo.
echo 환경 변수를 설정합니다...
set SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%
echo.
echo ✅ 환경 변수가 설정되었습니다!
echo 이제 npm run dev를 실행하세요.
echo.
pause
