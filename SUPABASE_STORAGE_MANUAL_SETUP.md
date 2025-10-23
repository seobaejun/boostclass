# Supabase Storage 수동 설정 가이드

## 🚨 문제 상황
```
ERROR: 42501: must be owner of table objects
```

SQL로 직접 RLS 정책을 수정할 수 없습니다. Supabase 대시보드에서 수동으로 설정해야 합니다.

## 🛠️ 해결 방법: 대시보드에서 설정

### 1단계: 스토리지 버킷 생성

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Storage 메뉴 클릭**
   - 좌측 메뉴에서 `Storage` 클릭

3. **새 버킷 생성**
   - `Create bucket` 버튼 클릭
   - **Bucket name**: `ebook-files`
   - **Public bucket**: ❌ (체크 해제 - 비공개)
   - `Create bucket` 클릭

### 2단계: RLS 정책 설정

1. **Storage 설정 페이지**
   - Storage → `ebook-files` 버킷 클릭
   - 우상단 `Settings` 또는 `Policies` 탭 클릭

2. **정책 추가**
   
   **정책 1: 파일 읽기 허용**
   - `New Policy` 클릭
   - **Policy name**: `Anyone can view ebook files`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public` (또는 `authenticated`)
   - **Policy definition**: 
     ```sql
     bucket_id = 'ebook-files'
     ```

   **정책 2: 파일 업로드 허용**
   - `New Policy` 클릭
   - **Policy name**: `Authenticated users can upload ebook files`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition**: 
     ```sql
     bucket_id = 'ebook-files' AND auth.role() = 'authenticated'
     ```

   **정책 3: 파일 삭제 허용**
   - `New Policy` 클릭
   - **Policy name**: `Authenticated users can delete ebook files`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **Policy definition**: 
     ```sql
     bucket_id = 'ebook-files' AND auth.role() = 'authenticated'
     ```

### 3단계: 임시 해결책 (빠른 테스트용)

만약 위 방법이 복잡하다면, 임시로 **Public bucket**으로 설정:

1. **버킷 설정 변경**
   - `ebook-files` 버킷 → Settings
   - `Public bucket` 체크박스 ✅ 활성화
   - 이렇게 하면 RLS 정책 없이도 업로드/다운로드 가능

## 🔄 대안: 서비스 키 사용

환경 변수에 서비스 키를 설정하면 RLS를 우회할 수 있습니다:

```powershell
# PowerShell에서 실행
$env:SUPABASE_SERVICE_ROLE_KEY="여기에_서비스_키_입력"

# 서버 재시작
npm run dev
```

**서비스 키 찾는 방법:**
1. Supabase 대시보드 → Settings → API
2. `service_role` 키 복사 (매우 긴 JWT 토큰)

## ✅ 확인 방법

1. **버킷 생성 확인**
   - Storage 메뉴에서 `ebook-files` 버킷이 보여야 함

2. **업로드 테스트**
   - 전자책 관리 페이지에서 PDF 파일 업로드 시도
   - 더 이상 RLS 오류가 발생하지 않아야 함

## 🎯 권장 순서

1. **먼저 3단계 시도** (Public bucket으로 임시 설정)
2. **업로드 테스트** 성공 확인
3. **나중에 1-2단계 적용** (보안을 위한 정책 설정)

이 방법으로 RLS 정책 오류를 해결할 수 있습니다! 🚀
