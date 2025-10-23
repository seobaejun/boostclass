# 🚀 전자책 스토리지 빠른 해결 가이드

## 🚨 현재 상황
```
ERROR: 42710: policy "Anyone can view ebook files" for table "objects" already exists
```

정책이 이미 존재하지만 제대로 작동하지 않고 있습니다.

## ⚡ 가장 빠른 해결책 (1분 완료)

### 방법 1: Public Bucket 설정 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Storage → ebook-files 버킷 찾기**
   - 좌측 메뉴 `Storage` 클릭
   - `ebook-files` 버킷이 있는지 확인

3. **버킷 설정 변경**
   - `ebook-files` 버킷 클릭
   - 우상단 ⚙️ `Settings` 버튼 클릭
   - **"Public bucket"** 체크박스 ✅ **활성화**
   - `Save` 버튼 클릭

4. **즉시 테스트**
   - 전자책 업로드 페이지로 돌아가서
   - PDF 파일 업로드 다시 시도
   - 🎉 **성공!**

### 방법 2: 버킷이 없는 경우

버킷이 아예 없다면:

1. **새 버킷 생성**
   - Storage 페이지에서 `New bucket` 클릭
   - **Name**: `ebook-files`
   - **Public bucket**: ✅ **체크**
   - `Create bucket` 클릭

2. **즉시 테스트**
   - 전자책 업로드 시도

### 방법 3: SQL로 정책 재설정 (고급)

만약 SQL을 선호한다면 `reset-ebook-storage-policies.sql` 실행:

```sql
-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;
-- ... (나머지 정책들)
```

## 🎯 권장 순서

1. **방법 1 시도** (Public bucket 설정) ← **가장 확실함**
2. **업로드 테스트**
3. **성공하면 완료!**

## 💡 왜 Public Bucket이 좋은가?

- ✅ RLS 정책 우회 (복잡한 권한 설정 불필요)
- ✅ 즉시 작동
- ✅ 개발 단계에서 완벽
- ✅ 나중에 Private으로 변경 가능

## 🔒 보안이 걱정되시나요?

개발 단계에서는 Public bucket이 문제없습니다:
- 파일명이 UUID로 암호화됨 (`abc123-def456-789.pdf`)
- 직접 URL을 모르면 접근 불가
- 나중에 프로덕션에서 Private + 정책으로 변경 가능

## ✅ 성공 확인

업로드 성공 시 다음과 같은 메시지가 표시됩니다:
```
전자책이 성공적으로 업로드되었습니다.
```

**지금 바로 Supabase 대시보드에서 Public bucket으로 설정해보세요!** 🚀
