# Supabase Service Key 설정 가이드

## 문제 상황
```
파일 업로드 실패: new row violates row-level security policy
```

이 오류는 Supabase의 Row Level Security (RLS) 정책 때문에 발생합니다.

## 해결 방법

### 방법 1: 서비스 키 설정 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **서비스 키 확인**
   - 좌측 메뉴에서 `Settings` → `API` 클릭
   - `Project API keys` 섹션에서 `service_role` 키 복사
   - 이 키는 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 형태로 시작합니다

3. **환경 변수 설정**
   
   **Windows (PowerShell):**
   ```powershell
   $env:SUPABASE_SERVICE_ROLE_KEY="여기에_서비스_키_붙여넣기"
   ```
   
   **또는 .env.local 파일에 추가:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=여기에_서비스_키_붙여넣기
   ```

4. **Next.js 서버 재시작**
   ```bash
   npm run dev
   ```

### 방법 2: RLS 정책 수정 (임시 해결책)

`fix-ebook-storage-rls.sql` 파일을 Supabase SQL Editor에서 실행:

```sql
-- 임시로 RLS 비활성화 (테스트용)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 또는 모든 작업을 허용하는 정책 생성
CREATE POLICY "Allow all operations on ebook files" ON storage.objects
FOR ALL USING (bucket_id = 'ebook-files');
```

## 확인 방법

1. **서버 로그 확인**
   - 서버 시작 시 다음 메시지가 표시되어야 합니다:
   ```
   🔑 Request/Response용 Supabase 클라이언트 생성: {
     hasServiceKey: true,
     canBypassRLS: true,
     isServiceRole: true
   }
   ```

2. **업로드 테스트**
   - 전자책 관리 페이지에서 PDF 파일 업로드 시도
   - 더 이상 RLS 오류가 발생하지 않아야 합니다

## 보안 참고사항

- **서비스 키는 매우 강력한 권한**을 가지므로 안전하게 관리해야 합니다
- **프로덕션 환경**에서는 반드시 환경 변수로 설정하고 코드에 하드코딩하지 마세요
- **개발 환경**에서만 RLS를 비활성화하고, 프로덕션에서는 적절한 정책을 설정하세요
