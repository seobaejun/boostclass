# 이미지 업로드 문제 해결 가이드

## 문제: 이미지 업로드가 실패함

### 1단계: 콘솔 로그 확인

**브라우저 콘솔 (F12 → Console 탭):**
- `📤 이미지 업로드 시작:` 로그 확인
- `📡 업로드 응답 상태:` 로그 확인
- 에러 메시지 확인

**서버 콘솔 (터미널):**
- `📤 이미지 업로드 API 시작` 로그 확인
- `🔑 서비스 키 확인:` 로그 확인
- `🪣 사용 가능한 버킷 목록:` 로그 확인
- 에러 메시지 확인

### 2단계: 서비스 키 확인

**확인 방법:**
1. `.env.local` 파일 열기
2. `SUPABASE_SERVICE_ROLE_KEY` 항목 확인
3. 값이 있는지, 올바른지 확인

**서비스 키 찾기:**
1. Supabase 대시보드 접속
2. Settings → API
3. `service_role` 키 복사
4. `.env.local`에 추가:
   ```
   SUPABASE_SERVICE_ROLE_KEY=여기에_서비스_키_붙여넣기
   ```
5. 서버 재시작 (`npm run dev`)

### 3단계: 버킷 확인

**Supabase 대시보드에서 확인:**
1. Storage → Buckets
2. 다음 버킷들이 존재하는지 확인:
   - `course-thumbnails` (강의 썸네일)
   - `course-images` (강의 상세 이미지)
   - `ebook-thumbnails` (전자책 썸네일)
   - `ebook-details` (전자책 상세 이미지)

**없다면:**
- `fix-course-detail-image-upload.sql` 실행
- 또는 Supabase Dashboard에서 수동 생성

### 4단계: RLS 정책 확인

**SQL Editor에서 실행:**
```sql
SELECT 
  policyname as "정책명",
  cmd as "명령어"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND (policyname LIKE '%course%' OR policyname LIKE '%ebook%');
```

**정책이 없다면:**
- `fix-course-detail-image-upload.sql` 실행

### 5단계: 일반적인 에러 메시지 해결

#### 에러: "bucket not found"
**해결:** 버킷이 생성되지 않았습니다.
- `fix-course-detail-image-upload.sql` 실행

#### 에러: "new row violates row-level security policy"
**해결:** RLS 정책 문제입니다.
1. 서비스 키 설정 확인 (2단계)
2. 서버 재시작
3. 그래도 안 되면 `fix-course-detail-image-upload.sql` 재실행

#### 에러: "file too large"
**해결:** 파일 크기가 10MB를 초과했습니다.
- 이미지를 압축하거나 더 작은 파일로 업로드

#### 에러: "invalid file type"
**해결:** 이미지 파일만 업로드 가능합니다.
- JPEG, PNG, WebP, GIF 파일만 지원

### 6단계: 추가 디버깅

**업로드 API 직접 테스트:**
```bash
curl -X POST http://localhost:3000/api/admin/upload \
  -F "file=@test-image.jpg" \
  -F "type=detail"
```

**Supabase Storage 직접 확인:**
1. Supabase Dashboard → Storage
2. 각 버킷 클릭
3. 파일이 업로드되어 있는지 확인

### 체크리스트

- [ ] `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 설정됨
- [ ] 서버 재시작함
- [ ] 모든 필요한 버킷이 생성됨
- [ ] RLS 정책이 설정됨
- [ ] 브라우저 콘솔에서 에러 확인함
- [ ] 서버 콘솔에서 에러 확인함
- [ ] 파일 크기가 10MB 이하임
- [ ] 이미지 파일 형식이 올바름 (JPEG, PNG, WebP, GIF)

### 여전히 문제가 있다면

콘솔에 표시된 **정확한 에러 메시지**를 공유해주세요:
1. 브라우저 콘솔의 에러 메시지
2. 서버 콘솔의 에러 메시지
3. HTTP 상태 코드 (예: 500, 403)

이 정보를 바탕으로 추가로 해결할 수 있습니다.

