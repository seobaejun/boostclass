# Vercel 환경 변수 설정 가이드

## 📋 개요

Vercel 배포 시 필요한 환경 변수 목록과 설정 방법을 안내합니다.

---

## ✅ 필수 환경 변수 (반드시 설정 필요)

### 1. Supabase 관련

| 환경 변수명 | 설명 | Vercel 설정 | 로컬 .env.local |
|-----------|------|------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ 필수 | ✅ 필수 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 API 키 | ✅ 필수 | ✅ 필수 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 키 (이미지 업로드 등에 필요) | ✅ 권장 | ✅ 권장 |

---

## 🔧 선택적 환경 변수 (기능 사용 시 설정)

### 2. 토스 페이먼츠 관련

| 환경 변수명 | 설명 | Vercel 설정 | 로컬 .env.local |
|-----------|------|------------|----------------|
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 페이먼츠 클라이언트 키 | 🔵 사용 시 | 🔵 사용 시 |
| `TOSS_SECRET_KEY` | 토스 페이먼츠 시크릿 키 | 🔵 사용 시 | 🔵 사용 시 |
| `NEXT_PUBLIC_BASE_URL` | 애플리케이션 기본 URL (결제 리다이렉트용) | 🔵 사용 시 | 🔵 사용 시 |

### 3. Cloudflare R2 관련 (현재 사용 안 함)

| 환경 변수명 | 설명 | Vercel 설정 | 로컬 .env.local |
|-----------|------|------------|----------------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID | ⚪ 사용 안 함 | ⚪ 선택사항 |
| `CLOUDFLARE_ACCESS_KEY_ID` | Cloudflare Access Key | ⚪ 사용 안 함 | ⚪ 선택사항 |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | Cloudflare Secret Key | ⚪ 사용 안 함 | ⚪ 선택사항 |
| `CLOUDFLARE_R2_BUCKET_NAME` | R2 버킷 이름 | ⚪ 사용 안 함 | ⚪ 선택사항 |
| `CLOUDFLARE_R2_PUBLIC_URL` | R2 Public URL | ⚪ 사용 안 함 | ⚪ 선택사항 |

---

## 🚀 설정 방법

### Vercel 대시보드에서 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - 배포 중인 프로젝트 클릭

3. **Settings → Environment Variables** 이동

4. **환경 변수 추가**
   - "Add New" 버튼 클릭
   - Key: 환경 변수명 입력
   - Value: 실제 값 입력
   - Environment: Production, Preview, Development 선택 (또는 All)
   - "Save" 클릭

5. **재배포**
   - Deployments 탭 → 최신 배포의 "..." → "Redeploy"

### 로컬 .env.local 파일 설정

로컬 개발 환경을 위한 `.env.local` 파일 예시:

```env
# Supabase 필수 설정
NEXT_PUBLIC_SUPABASE_URL=https://jlqdzdemcizwnrrhahea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_ANON_KEY_입력
SUPABASE_SERVICE_ROLE_KEY=여기에_SERVICE_ROLE_KEY_입력

# 토스 페이먼츠 (사용 시)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_P9BRQmyarYymBN4obxjNrJ07KzLN
TOSS_SECRET_KEY=여기에_시크릿_키_입력
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cloudflare R2 (현재 사용 안 함, 필요 시 추가)
# CLOUDFLARE_ACCOUNT_ID=
# CLOUDFLARE_ACCESS_KEY_ID=
# CLOUDFLARE_SECRET_ACCESS_KEY=
# CLOUDFLARE_R2_BUCKET_NAME=
# CLOUDFLARE_R2_PUBLIC_URL=
```

---

## ❓ 자주 묻는 질문

### Q1. Vercel과 로컬 .env.local 파일 둘 다 설정해야 하나요?

**A:** 네, 둘 다 설정해야 합니다.

- **로컬 .env.local**: 로컬 개발 환경에서 사용 (개발 서버 실행 시)
- **Vercel 환경 변수**: 배포된 프로덕션/프리뷰 환경에서 사용 (Vercel 배포 시)

### Q2. 환경 변수 이름이 다른가요?

**A:** 아니요, 동일한 이름을 사용합니다.

- Vercel에서 `NEXT_PUBLIC_SUPABASE_URL`로 설정
- 로컬 `.env.local`에서도 `NEXT_PUBLIC_SUPABASE_URL`로 설정
- **동일한 이름**을 사용하되, **각각 다른 곳에 설정**합니다.

### Q3. Vercel에만 설정하고 로컬에는 안 해도 되나요?

**A:** 아니요, 로컬 개발을 위해서는 `.env.local` 파일도 필요합니다.

- 로컬에서 `npm run dev` 실행 시 `.env.local` 파일을 읽습니다.
- Vercel 배포 시에는 Vercel의 환경 변수 설정을 읽습니다.

### Q4. 현재 Supabase URL이 무엇인가요?

**A:** 이전 대화 기록을 기준으로:
- `NEXT_PUBLIC_SUPABASE_URL=https://jlqdzdemcizwnrrhahea.supabase.co`

현재 사용 중인 실제 URL을 확인하려면:
1. Supabase 대시보드 접속
2. Settings → API에서 확인

---

## ✅ 체크리스트

Vercel 배포 전 확인 사항:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` Vercel에 설정
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` Vercel에 설정
- [ ] `SUPABASE_SERVICE_ROLE_KEY` Vercel에 설정 (이미지 업로드 필요 시)
- [ ] `NEXT_PUBLIC_TOSS_CLIENT_KEY` Vercel에 설정 (토스 페이먼츠 사용 시)
- [ ] `TOSS_SECRET_KEY` Vercel에 설정 (토스 페이먼츠 사용 시)
- [ ] `NEXT_PUBLIC_BASE_URL` Vercel에 설정 (프로덕션 URL로 설정, 예: `https://your-app.vercel.app`)
- [ ] 로컬 `.env.local` 파일도 동일한 변수들로 설정
- [ ] Vercel 재배포 완료

---

## 🔍 현재 에러 해결

**에러 메시지**: `Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "next_public_supabase_url", which does not exist.`

**해결 방법**:
1. Vercel 대시보드 → Settings → Environment Variables 이동
2. `NEXT_PUBLIC_SUPABASE_URL` 추가 (정확한 이름으로)
3. Supabase URL 값 입력
4. 재배포

---

## 📝 참고 사항

- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에서도 접근 가능합니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용되므로 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.
- Vercel에서는 환경 변수 이름이 대소문자를 구분합니다. 정확히 입력하세요.

