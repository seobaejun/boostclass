# 📚 전자책 이미지 저장소 설정 가이드

## 🎯 개요
전자책의 썸네일 이미지와 상세 이미지를 저장하기 위한 Supabase Storage 설정 가이드입니다.

## 📋 설정 단계

### 1️⃣ 데이터베이스 스키마 업데이트

**실행할 스크립트:** `add-ebook-image-fields.sql`

```sql
-- 전자책 테이블에 이미지 필드 추가
ALTER TABLE ebooks 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS detail_image_url TEXT;
```

**실행 방법:**
1. Supabase Dashboard → SQL Editor
2. 위 스크립트 복사/붙여넣기
3. "RUN" 버튼 클릭

### 2️⃣ Storage 버킷 생성

**실행할 스크립트:** `create-ebook-images-bucket.sql`

**실행 방법:**
1. Supabase Dashboard → SQL Editor
2. 스크립트 실행
3. 또는 Dashboard → Storage → "New bucket" 클릭
   - Bucket name: `ebook-images`
   - Public bucket: ✅ 체크

### 3️⃣ RLS 정책 설정

**추천 순서대로 시도:**

#### 🥇 1순위: 표준 정책
**스크립트:** `setup-ebook-images-policies.sql`
- 인증된 사용자만 업로드/수정/삭제
- 모든 사용자가 읽기 가능

#### 🥈 2순위: 간단한 정책 (문제 발생 시)
**스크립트:** `setup-ebook-images-simple-policies.sql`
- 모든 작업 허용 (개발용)

#### 🥉 3순위: RLS 완전 비활성화 (최후 수단)
**스크립트:** `disable-storage-rls-for-ebooks.sql`
- ⚠️ **주의**: 프로덕션에서 사용 금지!

## 🔧 문제 해결

### 업로드 실패 시
1. **버킷 존재 확인**
   ```sql
   SELECT * FROM storage.buckets WHERE name IN ('ebook-images', 'ebook-files');
   ```

2. **RLS 정책 확인**
   ```sql
   SELECT policyname, cmd FROM pg_policies 
   WHERE tablename = 'objects' AND policyname LIKE '%ebook%';
   ```

3. **서비스 키 확인**
   - `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 설정 확인

### 권한 오류 시
1. 간단한 정책으로 변경
2. RLS 임시 비활성화 (개발 환경만)
3. 버킷을 Public으로 설정

## 📁 파일 구조

```
Storage/
├── ebook-files/          # PDF 파일 저장
│   ├── uuid_filename.pdf
│   └── ...
└── ebook-images/         # 이미지 파일 저장
    ├── uuid_thumbnail_timestamp.jpg
    ├── uuid_detail_timestamp.png
    └── ...
```

## ✅ 설정 완료 확인

1. **관리자 페이지에서 전자책 업로드 테스트**
2. **이미지 미리보기 확인**
3. **전자책 목록/상세페이지에서 이미지 표시 확인**

## 🚨 주의사항

- **프로덕션 환경**에서는 RLS를 완전히 비활성화하지 마세요
- **이미지 파일 크기 제한**: 5MB
- **지원 형식**: JPG, PNG, GIF, WebP
- **PDF 파일**은 `ebook-files` 버킷에 저장됩니다
