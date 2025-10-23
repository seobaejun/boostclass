# 토스 페이먼츠 환경 변수 설정 가이드

## 1. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 토스 페이먼츠 클라이언트 키 (강의 결제와 동일한 테스트 키)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_P9BRQmyarYymBN4obxjNrJ07KzLN

# 토스 페이먼츠 시크릿 키 (테스트용)
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R

# 애플리케이션 기본 URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 2. 실제 토스 페이먼츠 키 발급

1. [토스 페이먼츠 개발자 센터](https://developers.tosspayments.com/) 접속
2. 회원가입 및 로그인
3. 내 상점 > 연동 키 메뉴에서 키 발급
4. 테스트 키를 복사하여 `.env.local`에 설정

## 3. 주의사항

- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- `NEXT_PUBLIC_` 접두사가 붙은 변수는 클라이언트에서 접근 가능
- `TOSS_SECRET_KEY`는 서버에서만 사용되며 절대 노출되면 안 됨

## 4. 현재 상태

- 임시 테스트 키가 코드에 하드코딩되어 있어 기본 테스트 가능
- 실제 서비스에서는 반드시 환경 변수로 설정 필요
