# 공지사항 테이블 설정 가이드

## 🚨 오류 해결: notices 테이블이 존재하지 않습니다

공지사항 작성 시 "notices 테이블이 존재하지 않습니다" 오류가 발생하면 다음 단계를 따라주세요.

## 📋 해결 방법

### 1단계: Supabase 대시보드 접속
1. 브라우저에서 [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택

### 2단계: SQL Editor 열기
1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New Query** 버튼 클릭

### 3단계: SQL 실행
다음 SQL 코드를 복사하여 붙여넣고 **Run** 버튼을 클릭하세요:

```sql
-- UUID 확장 활성화 (Supabase에서는 기본적으로 활성화되어 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- notices 테이블 생성
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' NOT NULL CHECK (priority IN ('normal', 'important')),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('published', 'draft', 'archived')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- RLS 비활성화 (테스트용)
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;

-- 테이블 생성 확인
SELECT 'notices 테이블이 성공적으로 생성되었습니다!' as message;
```

### 4단계: 테이블 생성 확인
SQL 실행 후 다음과 같은 메시지가 나타나면 성공입니다:
```
notices 테이블이 성공적으로 생성되었습니다!
```

### 5단계: 공지사항 작성 재시도
1. 관리자 페이지로 돌아가기: `http://localhost:3000/admin/content`
2. **공지사항** 탭 클릭
3. **새 공지사항 작성** 버튼 클릭
4. 공지사항 작성 및 저장

## 🎯 테이블 구조

생성된 `notices` 테이블의 구조:

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | UUID | 고유 식별자 (자동 생성) |
| `title` | TEXT | 공지사항 제목 |
| `content` | TEXT | 공지사항 내용 |
| `priority` | TEXT | 우선순위 (`normal`, `important`) |
| `author_name` | TEXT | 작성자 이름 |
| `author_email` | TEXT | 작성자 이메일 |
| `status` | TEXT | 상태 (`published`, `draft`, `archived`) |
| `views` | INTEGER | 조회수 |
| `created_at` | TIMESTAMPTZ | 생성일시 |
| `updated_at` | TIMESTAMPTZ | 수정일시 |

## 🔍 문제 해결

### 권한 오류가 발생하는 경우
만약 SQL 실행 시 권한 오류가 발생하면:
1. Supabase 프로젝트의 **소유자** 또는 **관리자** 권한이 있는지 확인
2. 올바른 프로젝트에 접속했는지 확인

### 테이블이 이미 존재한다는 오류
```sql
-- 기존 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'notices';
```

이미 테이블이 존재한다면 공지사항 작성이 정상적으로 작동해야 합니다.

## ✅ 완료 후 확인사항

테이블 생성 완료 후:
1. ✅ 공지사항 작성 기능 정상 작동
2. ✅ 일반공지/중요공지 선택 가능
3. ✅ 공지사항 목록에서 우선순위 표시
4. ✅ 수정 및 삭제 기능 작동

---

**도움이 필요하시면 언제든 문의해주세요!** 🚀
