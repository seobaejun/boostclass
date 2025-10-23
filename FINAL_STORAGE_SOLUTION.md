# 🚨 전자책 업로드 RLS 오류 - 최종 해결 가이드

## ❌ 문제 상황
```
파일 업로드 실패: new row violates row-level security policy
ERROR: 42501: must be owner of table objects
```

## 🔍 핵심 원인
- Supabase Storage의 RLS 정책이 파일 업로드를 차단
- SQL로는 `storage.objects` 테이블 수정 권한 없음
- **대시보드에서만 해결 가능**

## ✅ 유일한 해결 방법

### 🎯 방법 1: Public Bucket 설정 (권장)

**단계별 가이드:**

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Storage 메뉴로 이동**
   - 좌측 메뉴에서 `Storage` 클릭

3. **버킷 설정**
   
   **A. 버킷이 이미 있는 경우:**
   - `ebook-files` 버킷 클릭
   - 우상단 ⚙️ `Settings` 클릭
   - **"Public bucket"** 체크박스 ✅ **활성화**
   - `Save` 클릭

   **B. 버킷이 없는 경우:**
   - `New bucket` 또는 `Create bucket` 클릭
   - **Name**: `ebook-files`
   - **Public bucket**: ✅ **체크**
   - `Create bucket` 클릭

4. **확인**
   - Storage 페이지에서 `ebook-files` 옆에 **"Public"** 표시 확인

### 🔐 방법 2: 서비스 키 설정 (보안 강화)

**더 안전한 방법을 원한다면:**

1. **서비스 키 확인**
   - Supabase 대시보드 → Settings → API
   - `service_role` 키 복사 (eyJhbGciOiJIUzI1NiIs... 형태)

2. **환경 변수 설정**
   ```powershell
   # 새 PowerShell 창에서 실행
   $env:SUPABASE_SERVICE_ROLE_KEY="복사한_서비스_키"
   cd C:\booclass-master
   npm run dev
   ```

3. **서버 재시작 후 업로드 테스트**

## 🚀 즉시 실행할 단계

1. **지금 바로 Supabase 대시보드 열기**
2. **Storage → ebook-files → Public 설정**
3. **전자책 업로드 다시 시도**
4. **성공 확인!** 🎉

## ⚠️ 중요 사항

- **SQL 스크립트로는 해결 불가능**
- **대시보드 UI에서만 RLS 설정 변경 가능**
- **Public bucket은 개발 단계에서 안전함** (UUID 파일명으로 보호)
- **프로덕션에서는 서비스 키 + 적절한 정책 권장**

## ✅ 성공 확인 방법

업로드 성공 시 다음 메시지가 표시됩니다:
```
전자책이 성공적으로 업로드되었습니다.
```

**지금 바로 대시보드에서 Public bucket으로 설정하세요!** 🚀
