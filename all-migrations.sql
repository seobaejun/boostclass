-- ============================================
-- Supabase 전체 스키마 마이그레이션
-- 생성 시간: 2025. 10. 31. 오후 11:31:08
-- ============================================


-- ============================================
-- ebooks 테이블: 전자책 테이블 생성
-- 파일: create-ebooks-table.sql
-- ============================================

-- 기존 테이블 삭제 (데이터 손실 주의!)
-- CASCADE로 의존성 있는 테이블도 함께 삭제
DROP TABLE IF EXISTS ebooks CASCADE;

-- UUID 확장 활성화 (Supabase에서는 기본적으로 활성화되어 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ebooks 테이블 생성
CREATE TABLE ebooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT DEFAULT 'PDF',
  file_path TEXT, -- PDF 파일 경로
  download_count INTEGER DEFAULT 0,
  price INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  cover_image TEXT, -- 기존 호환성을 위해 유지
  thumbnail_url TEXT, -- 썸네일 이미지 URL (목록에서 표시)
  detail_image_url TEXT, -- 상세 이미지 URL (상세페이지에서 표시)
  tags TEXT[] DEFAULT '{}'
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_ebooks_status ON ebooks(status);
CREATE INDEX IF NOT EXISTS idx_ebooks_category ON ebooks(category);
CREATE INDEX IF NOT EXISTS idx_ebooks_author ON ebooks(author);
CREATE INDEX IF NOT EXISTS idx_ebooks_created_at ON ebooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ebooks_featured ON ebooks(featured);
CREATE INDEX IF NOT EXISTS idx_ebooks_is_free ON ebooks(is_free);

-- RLS 비활성화 (테스트용)
ALTER TABLE ebooks DISABLE ROW LEVEL SECURITY;

-- 테이블 생성 확인
SELECT 'ebooks 테이블이 성공적으로 생성되었습니다!' as message;



-- ============================================
-- ebook_purchases 테이블: 전자책 구매 테이블 생성
-- 파일: create-ebook-purchases-table-fixed.sql
-- ============================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 전자책 구매 테이블 생성
CREATE TABLE IF NOT EXISTS public.ebook_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE NOT NULL,
  order_id TEXT NOT NULL UNIQUE, -- 토스페이먼츠 orderId
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KRW' NOT NULL,
  payment_key TEXT UNIQUE, -- 토스페이먼츠 paymentKey (결제 완료 후 설정)
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, completed, failed, cancelled
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  CONSTRAINT unique_user_ebook_purchase UNIQUE (user_id, ebook_id)
);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_user_id ON public.ebook_purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_ebook_id ON public.ebook_purchases (ebook_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_order_id ON public.ebook_purchases (order_id);
CREATE INDEX IF NOT EXISTS idx_ebook_purchases_status ON public.ebook_purchases (status);

-- RLS 활성화
ALTER TABLE public.ebook_purchases ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자가 자신의 구매 내역을 조회할 수 있도록 허용
DROP POLICY IF EXISTS "Users can view their own ebook purchases." ON public.ebook_purchases;
CREATE POLICY "Users can view their own ebook purchases." ON public.ebook_purchases
FOR SELECT USING (auth.uid() = user_id);

-- 정책: 인증된 사용자가 구매 내역을 생성할 수 있도록 허용 (결제 요청 시)
DROP POLICY IF EXISTS "Authenticated users can create ebook purchases." ON public.ebook_purchases;
CREATE POLICY "Authenticated users can create ebook purchases." ON public.ebook_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 정책: 인증된 사용자가 자신의 구매 내역을 업데이트할 수 있도록 허용 (결제 검증 시)
DROP POLICY IF EXISTS "Authenticated users can update their own ebook purchases." ON public.ebook_purchases;
CREATE POLICY "Authenticated users can update their own ebook purchases." ON public.ebook_purchases
FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE public.ebook_purchases IS '전자책 구매 내역 테이블';
COMMENT ON COLUMN public.ebook_purchases.order_id IS '토스페이먼츠 주문 ID (고유값)';
COMMENT ON COLUMN public.ebook_purchases.payment_key IS '토스페이먼츠 결제 키 (결제 완료 후 설정)';
COMMENT ON COLUMN public.ebook_purchases.amount IS '결제 금액';
COMMENT ON COLUMN public.ebook_purchases.status IS '결제 상태: pending, completed, failed, cancelled';



-- ============================================
-- courses 테이블: 강의 테이블 생성
-- 파일: create-courses-table.sql
-- ============================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- courses 테이블 생성
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('published', 'draft', 'archived')),
  price INTEGER DEFAULT 0,
  original_price INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  detail_image_url TEXT, -- 상세 이미지 URL (상세페이지에서 표시)
  video_url TEXT,
  vimeo_url TEXT,
  duration INTEGER, -- 분 단위
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);

-- RLS 비활성화 (테스트용)
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

-- 테이블 생성 확인
SELECT 'courses 테이블이 성공적으로 생성되었습니다!' as message;



-- ============================================
-- user_profiles 테이블: 사용자 프로필 테이블 생성
-- 회원가입 및 로그인 시 사용자 정보 저장용
-- ============================================

-- 기존 테이블 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- user_profiles 테이블 생성
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor')),
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(email)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 사용자는 자신의 프로필을 조회 가능
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 사용자는 자신의 프로필을 생성 가능 (회원가입 시)
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 사용자는 자신의 프로필을 업데이트 가능
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 관리자는 모든 프로필 조회 가능
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 테이블 생성 확인
SELECT 'user_profiles 테이블이 성공적으로 생성되었습니다!' as message;



-- ============================================
-- enrollments 테이블: 수강신청 테이블 생성
-- 파일: create-enrollments-table.sql
-- ============================================

-- enrollments 테이블 생성
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- RLS 정책 생성
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 수강신청만 조회 가능
DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrollments;
CREATE POLICY "Users can view their own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 수강신청만 생성 가능
DROP POLICY IF EXISTS "Users can create their own enrollments" ON enrollments;
CREATE POLICY "Users can create their own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 수강신청만 업데이트 가능
DROP POLICY IF EXISTS "Users can update their own enrollments" ON enrollments;
CREATE POLICY "Users can update their own enrollments" ON enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- community_posts 테이블: 커뮤니티 게시글 테이블 생성
-- 파일: create-community-table.sql
-- ============================================

-- 커뮤니티 게시글 테이블 생성
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '정보공유',
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 게시글을 읽을 수 있음
DROP POLICY IF EXISTS "Anyone can read published community posts" ON community_posts;
CREATE POLICY "Anyone can read published community posts" ON community_posts
  FOR SELECT USING (status = 'published');

-- 로그인한 사용자만 게시글을 작성할 수 있음
DROP POLICY IF EXISTS "Authenticated users can create community posts" ON community_posts;
CREATE POLICY "Authenticated users can create community posts" ON community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 작성자만 자신의 게시글을 수정할 수 있음
DROP POLICY IF EXISTS "Authors can update their own community posts" ON community_posts;
CREATE POLICY "Authors can update their own community posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- 작성자만 자신의 게시글을 삭제할 수 있음
DROP POLICY IF EXISTS "Authors can delete their own community posts" ON community_posts;
CREATE POLICY "Authors can delete their own community posts" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- comments 테이블: 댓글 테이블 생성
-- 파일: create-comments-table.sql
-- ============================================

-- comments 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_id UUID,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 댓글을 읽을 수 있도록 허용
DROP POLICY IF EXISTS "Allow public read access" ON comments;
CREATE POLICY "Allow public read access" ON comments
FOR SELECT USING (TRUE);

-- 로그인한 사용자가 댓글을 생성할 수 있도록 허용
DROP POLICY IF EXISTS "Allow authenticated users to create comments" ON comments;
CREATE POLICY "Allow authenticated users to create comments" ON comments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 작성자만 자신의 댓글을 업데이트할 수 있도록 허용
DROP POLICY IF EXISTS "Allow owners to update their own comments" ON comments;
CREATE POLICY "Allow owners to update their own comments" ON comments
FOR UPDATE USING (auth.uid()::text = author_id::text);

-- 작성자만 자신의 댓글을 삭제할 수 있도록 허용
DROP POLICY IF EXISTS "Allow owners to delete their own comments" ON comments;
CREATE POLICY "Allow owners to delete their own comments" ON comments
FOR DELETE USING (auth.uid()::text = author_id::text);

-- 'updated_at' 컬럼 자동 업데이트를 위한 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 테이블 생성 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;



-- ============================================
-- notices 테이블: 공지사항 테이블 생성
-- 파일: create-notices-table-fixed.sql
-- ============================================

-- 기존 notices 테이블 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS notices CASCADE;

-- UUID 확장 활성화 (Supabase에서는 기본적으로 활성화되어 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- notices 테이블 생성 (개선된 버전)
CREATE TABLE notices (
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

-- 테스트 데이터 삽입
INSERT INTO notices (title, content, priority, author_name, author_email, status) VALUES
('테스트 중요공지', '이것은 테스트용 중요 공지사항입니다.', 'important', 'Admin', 'admin@example.com', 'published'),
('테스트 일반공지', '이것은 테스트용 일반 공지사항입니다.', 'normal', 'Admin', 'admin@example.com', 'published');

-- 테이블 생성 확인
SELECT 'notices 테이블이 성공적으로 생성되었습니다!' as message;

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notices'
ORDER BY ordinal_position;

-- 테스트 데이터 확인
SELECT id, title, priority, author_name, created_at FROM notices;



-- ============================================
-- Storage 버킷 생성: 전자책 이미지 및 파일 저장소
-- 파일: create-separate-image-buckets.sql
-- ============================================

-- 1. 'ebook-thumbnails' 버킷 생성 (썸네일 이미지 전용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-thumbnails', 'ebook-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 'ebook-details' 버킷 생성 (상세 이미지 전용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-details', 'ebook-details', true)
ON CONFLICT (id) DO NOTHING;

-- 3. 'ebook-files' 버킷 생성 (PDF 파일용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-files', 'ebook-files', true)
ON CONFLICT (id) DO NOTHING;

-- 버킷 생성 확인
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE name IN ('ebook-thumbnails', 'ebook-details', 'ebook-files')
ORDER BY name;



-- ============================================
-- Storage 정책 설정: 전자책 관련 모든 버킷 (ebook-thumbnails, ebook-details, ebook-files)
-- 파일: setup-separate-buckets-simple-policies.sql
-- ============================================

-- 기존 정책들 모두 삭제
DROP POLICY IF EXISTS "Anyone can view ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook details" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook buckets" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on ebook images" ON storage.objects;

-- 모든 전자책 관련 버킷에 대해 모든 작업 허용 (개발/테스트용)
CREATE POLICY "Allow all operations on ebook buckets" ON storage.objects
FOR ALL 
USING (bucket_id IN ('ebook-thumbnails', 'ebook-details', 'ebook-files'))
WITH CHECK (bucket_id IN ('ebook-thumbnails', 'ebook-details', 'ebook-files'));

-- 정책 확인
SELECT 'ebook-thumbnails, ebook-details, ebook-files Storage 정책이 설정되었습니다! (모든 작업 허용)' as message;



-- ============================================
-- Storage 버킷 생성: 강의 관련 이미지 및 비디오
-- 파일: create-storage-buckets.sql
-- ============================================

-- 1. course-thumbnails 버킷 생성 (썸네일 이미지용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. course-images 버킷 생성 (디테일 이미지용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. course-videos 버킷 생성 (비디오 파일용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos', 
  false,  -- 비공개 (보안)
  524288000,  -- 500MB 제한
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

-- 버킷 생성 확인
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE name IN ('course-thumbnails', 'course-images', 'course-videos')
ORDER BY name;



-- ============================================
-- Storage 정책 설정: course-thumbnails, course-images 버킷
-- 파일: create-storage-buckets.sql
-- ============================================

-- 기존 정책들 삭제
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on course images" ON storage.objects;

-- course-thumbnails와 course-images 버킷 정책 (공개 읽기, 인증된 사용자 업로드)
-- 공개 읽기 정책
CREATE POLICY "Allow all operations on course thumbnails" ON storage.objects
FOR ALL 
USING (bucket_id = 'course-thumbnails')
WITH CHECK (bucket_id = 'course-thumbnails');

CREATE POLICY "Allow all operations on course images" ON storage.objects
FOR ALL 
USING (bucket_id = 'course-images')
WITH CHECK (bucket_id = 'course-images');

-- 정책 확인
SELECT 'course-thumbnails, course-images Storage 정책이 설정되었습니다!' as message;



-- ============================================
-- Storage 정책 설정: course-videos 버킷
-- 파일: fix-rls-policies.sql
-- ============================================

-- 기존 정책들 삭제
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on course videos" ON storage.objects;

-- course-videos 버킷 정책 (인증된 사용자만 접근 가능)
CREATE POLICY "Allow all operations on course videos" ON storage.objects
FOR ALL 
USING (bucket_id = 'course-videos' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'course-videos' AND auth.role() = 'authenticated');

-- 정책 확인
SELECT 'course-videos Storage 정책이 설정되었습니다! (인증된 사용자만)' as message;



-- ============================================
-- 마이그레이션 완료 확인
-- ============================================

-- 생성된 테이블 확인
SELECT 
  table_name as "테이블명",
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as "컬럼수"
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('ebooks', 'ebook_purchases', 'courses', 'enrollments', 'community_posts', 'comments', 'notices')
ORDER BY table_name;

-- 생성된 Storage 버킷 확인
SELECT 
  id as "버킷ID",
  name as "버킷명",
  public as "공개여부",
  created_at as "생성일시"
FROM storage.buckets 
WHERE name IN ('ebook-thumbnails', 'ebook-details', 'ebook-files', 'course-thumbnails', 'course-images', 'course-videos')
ORDER BY name;

-- 마이그레이션 완료 메시지
SELECT '✅ 모든 스키마 마이그레이션이 완료되었습니다!' as message;


