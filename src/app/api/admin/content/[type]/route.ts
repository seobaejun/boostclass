import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    console.log(`📚 ${type} 콘텐츠 API 호출됨`)
    console.log('🔍 요청 URL:', request.url)
    console.log('🔍 요청 메서드:', request.method)
    
    // Authorization 헤더에서 토큰 추출 (임시로 관리자 권한 체크 우회)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ 인증 토큰이 없습니다.')
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('🔑 토큰 추출 완료')
    
    // Supabase에서 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('❌ 사용자 인증 실패:', userError?.message)
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }
    
    console.log('✅ 사용자 인증 성공:', user.email)
    console.log('⚠️ 임시로 관리자 권한 체크를 우회합니다.')

    // URL 파라미터 추출
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || 'all'
    const filterStatus = searchParams.get('filterStatus') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('🔍 검색 파라미터:', { search, status, category, filterStatus, page, limit })

    let items: any[] = []

    // 콘텐츠 타입에 따라 다른 데이터 조회
    switch (type) {
      case 'courses':
        console.log('📚 강의 데이터 조회 시작')
        // 강의 데이터 조회
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            category,
            instructor_name,
            price,
            thumbnail_url,
            created_at,
            updated_at,
            status
          `)
          .order('created_at', { ascending: false })

        console.log('📊 강의 조회 결과:', { 
          success: !coursesError, 
          count: courses?.length || 0, 
          error: coursesError?.message 
        })

        if (coursesError) {
          console.error('❌ 강의 데이터 조회 실패:', coursesError.message)
          return NextResponse.json(
            { success: false, error: '강의 데이터를 가져오는데 실패했습니다.' },
            { status: 500 }
          )
        }

        items = courses?.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          instructor: course.instructor_name,
          price: course.price,
          thumbnail: course.thumbnail_url,
          createdAt: course.created_at,
          updatedAt: course.updated_at,
          status: course.status || 'active',
          type: 'course'
        })) || []
        
        console.log('✅ 강의 데이터 변환 완료:', items.length, '건')
        break

      case 'ebooks':
        // 전자책 데이터 조회 (현재는 빈 배열)
        items = []
        break

      case 'notices':
        // 공지사항 데이터 조회
        console.log('📢 공지사항 데이터 조회 시작')
        try {
          // 쿼리 빌더 시작
          let query = supabase
            .from('notices')
            .select(`
              id,
              title,
              content,
              priority,
              author_name,
              author_email,
              status,
              views,
              created_at,
              updated_at
            `)

          // 검색 필터링
          if (search) {
            console.log(`🔍 검색어 적용: ${search}`)
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,author_name.ilike.%${search}%`)
          }

          // 상태 필터링 (status 파라미터 사용)
          if (status !== 'all') {
            console.log(`🔍 상태 필터 적용: ${status}`)
            query = query.eq('status', status)
          } else {
            console.log('🔍 상태 필터 없음 (all)')
          }

          // 정렬 및 페이지네이션
          query = query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

          const { data: notices, error: noticesError } = await query

          if (noticesError) {
            console.error('❌ 공지사항 데이터 조회 실패:', noticesError.message)
            // 테이블이 존재하지 않는 경우 빈 배열 반환
            if (noticesError.code === '42P01' || noticesError.message.includes('does not exist')) {
              console.log('⚠️ notices 테이블이 존재하지 않습니다.')
              items = []
            } else {
              throw noticesError
            }
          } else {
            items = notices?.map(notice => ({
              id: notice.id,
              title: notice.title,
              content: notice.content?.substring(0, 100) + '...',
              priority: notice.priority,
              author: notice.author_name,
              author_email: notice.author_email,
              status: notice.status || 'published',
              views: notice.views || 0,
              createdAt: notice.created_at,
              updatedAt: notice.updated_at,
              type: 'notices'
            })) || []
          }
        } catch (error) {
          console.error('❌ 공지사항 데이터 조회 중 오류:', error)
          items = []
        }
        break

      case 'reviews':
        // 리뷰 데이터 조회 (현재는 빈 배열)
        items = []
        break

      case 'community':
        // 커뮤니티 데이터 조회
        console.log('📚 커뮤니티 데이터 조회 시작')
        try {
          // 쿼리 빌더 시작
          let query = supabase
            .from('community_posts')
            .select(`
              id,
              title,
              content,
              category,
              author_name,
              author_email,
              tags,
              status,
              views,
              likes,
              created_at,
              updated_at
            `)

          // 검색어 필터링
          if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,author_name.ilike.%${search}%`)
          }

          // 카테고리 필터링
          if (category !== 'all') {
            query = query.eq('category', category)
          }

          // 상태 필터링 (status 파라미터 사용)
          if (status !== 'all') {
            console.log(`🔍 상태 필터 적용: ${status}`)
            query = query.eq('status', status)
          } else {
            console.log('🔍 상태 필터 없음 (all)')
          }

          // 정렬 및 페이지네이션
          query = query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

          const { data: communityPosts, error: communityError } = await query

          if (communityError) {
            console.error('❌ 커뮤니티 데이터 조회 실패:', communityError.message)
            // 테이블이 존재하지 않는 경우 빈 배열 반환
            if (communityError.code === '42P01' || communityError.message.includes('does not exist')) {
              console.log('⚠️ community_posts 테이블이 존재하지 않습니다.')
              items = []
            } else {
              throw communityError
            }
          } else {
            items = communityPosts?.map(post => ({
              id: post.id,
              title: post.title,
              content: post.content?.substring(0, 100) + '...',
              category: post.category,
              author: post.author_name,
              author_email: post.author_email,
              tags: post.tags,
              status: post.status || 'published',
              views: post.views || 0,
              likes: post.likes || 0,
              createdAt: post.created_at,
              updatedAt: post.updated_at,
              type: 'community'
            })) || []
          }
        } catch (error) {
          console.error('❌ 커뮤니티 데이터 조회 중 오류:', error)
          items = []
        }
        break

      case 'success-stories':
        // 성공 스토리 데이터 조회 (현재는 빈 배열)
        items = []
        break

      default:
        console.log('❌ 알 수 없는 콘텐츠 타입:', type)
        return NextResponse.json(
          { success: false, error: '알 수 없는 콘텐츠 타입입니다.' },
          { status: 400 }
        )
    }

    console.log(`📈 ${type} 데이터 조회 완료:`, items.length, '건')

    // 총 개수 조회 (페이지네이션을 위해)
    let totalCount = items.length
    
    // 커뮤니티와 공지사항의 경우 항상 전체 개수를 조회
    if (type === 'community' || type === 'notices') {
      // 총 개수를 별도로 조회 (필터링 적용)
      try {
        let countQuery
        
        if (type === 'community') {
          countQuery = supabase
            .from('community_posts')
            .select('*', { count: 'exact', head: true })

          if (search) {
            countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,author_name.ilike.%${search}%`)
          }
          if (category !== 'all') {
            countQuery = countQuery.eq('category', category)
          }
          if (status !== 'all') {
            countQuery = countQuery.eq('status', status)
          }
        } else if (type === 'notices') {
          countQuery = supabase
            .from('notices')
            .select('*', { count: 'exact', head: true })

          if (search) {
            countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,author_name.ilike.%${search}%`)
          }
          if (status !== 'all') {
            countQuery = countQuery.eq('status', status)
          }
        }

        const { count } = await countQuery
        totalCount = count || 0
      } catch (error) {
        console.error('❌ 총 개수 조회 실패:', error)
      }
    }

    const response = {
      success: true,
      items: items,
      total: totalCount,
      page,
      limit
    }
    
    console.log('📤 API 응답 데이터:', response)
    
    return NextResponse.json(response)

  } catch (error: any) {
    console.error(`❌ 콘텐츠 조회 오류:`, error)
    return NextResponse.json(
      { success: false, error: '콘텐츠를 가져오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    console.log(`📝 ${type} 콘텐츠 생성 API 호출됨`)

    // Supabase 연결 테스트 (가장 간단한 테스트)
    console.log('🔍 Supabase 연결 상태 확인 중...')
    console.log('🔍 Supabase URL:', supabase.supabaseUrl)
    console.log('🔍 Supabase Key 접두사:', supabase.supabaseKey?.substring(0, 20) + '...')
    
    try {
      // 연결 테스트를 우회하고 바로 notices 테이블 확인
      console.log('⚠️ 연결 테스트를 우회하고 바로 notices 테이블 존재 여부를 확인합니다.')
      const { data: testData, error: testError } = await supabase
        .from('notices')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('❌ notices 테이블 조회 실패:', testError)
        console.error('❌ 오류 코드:', testError.code)
        console.error('❌ 오류 메시지:', testError.message)
        
        // notices 테이블이 존재하지 않는 경우 (42P01 또는 PGRST106)
        if (testError.code === '42P01' || testError.code === 'PGRST106' || 
            testError.message.includes('does not exist') || 
            testError.message.includes('not found')) {
          console.log('⚠️ notices 테이블이 존재하지 않습니다. 하지만 Supabase 연결은 정상입니다.')
        } else {
          // 다른 연결 오류
          console.error('❌ Supabase 연결 자체에 문제가 있습니다.')
          return NextResponse.json({ 
            success: false, 
            error: `Supabase 연결 실패: ${testError.message}`,
            errorCode: testError.code,
            errorDetails: testError.details,
            errorHint: testError.hint,
            connectionTest: 'failed'
          }, { status: 500 })
        }
      } else {
        console.log('✅ Supabase 연결 성공, notices 테이블 존재함, 데이터 수:', testData?.length || 0, '개')
      }
    } catch (connectionError: any) {
      console.error('❌ Supabase 연결 예외:', connectionError)
      console.error('❌ 연결 예외 타입:', typeof connectionError)
      console.error('❌ 연결 예외 메시지:', connectionError.message)
      console.error('❌ 연결 예외 스택:', connectionError.stack)
      
      return NextResponse.json({ 
        success: false, 
        error: `Supabase 연결 예외: ${connectionError.message || connectionError}`,
        errorType: typeof connectionError,
        connectionError: connectionError.toString(),
        connectionTest: 'exception'
      }, { status: 500 })
    }

    // 세션 확인 (임시로 우회)
    console.log('⚠️ 임시로 세션 체크를 우회합니다.')
    const session = { user: { id: 'test-user-id', email: 'test@example.com' } }
    
    // const { data: { session } } = await supabase.auth.getSession()
    // if (!session) {
    //   return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    // }

    // 관리자 권한 확인 (임시 우회)
    console.log('⚠️ 임시로 관리자 권한 체크를 우회합니다.')

    console.log('📥 요청 본문 파싱 시작...')
    let body
    try {
      body = await request.json()
      console.log('📥 요청 본문 파싱 성공:', body)
    } catch (bodyError) {
      console.error('❌ 요청 본문 파싱 실패:', bodyError)
      return NextResponse.json({ 
        success: false, 
        error: `요청 본문 파싱 실패: ${bodyError.message}`,
        parseError: bodyError.toString()
      }, { status: 400 })
    }

    const { title, content, priority, status } = body
    console.log('📋 추출된 필드:', { title, content, priority, status })

    if (!title || !content) {
      console.log('❌ 필수 필드 누락:', { hasTitle: !!title, hasContent: !!content })
      return NextResponse.json({ success: false, error: '제목과 내용을 입력해주세요.' }, { status: 400 })
    }

    // 사용자 프로필 조회 (임시로 우회)
    console.log('⚠️ 사용자 프로필 조회를 우회하고 기본값을 사용합니다.')
    const userProfile = {
      full_name: session.user.email || 'Admin User',
      email: session.user.email || 'admin@example.com'
    }
    
    // const { data: userProfile, error: userProfileError } = await supabase
    //   .from('user_profiles')
    //   .select('full_name, email')
    //   .eq('id', session.user.id)
    //   .single()

    // if (userProfileError || !userProfile) {
    //   console.error('❌ 사용자 프로필 조회 실패:', userProfileError?.message)
    //   return NextResponse.json({ success: false, error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 })
    // }

    console.log('🔄 콘텐츠 타입별 처리 시작:', type)
    let newItem
    let insertError

    switch (type) {
      case 'notices':
        console.log('📝 공지사항 처리 시작...')
        // UUID 생성을 위한 crypto 모듈 사용
        const { randomUUID } = require('crypto')
        
        const noticeData = {
          id: randomUUID(), // 명시적으로 UUID 생성
          title,
          content,
          priority: priority || 'normal',
          author_name: userProfile.full_name || session.user.email,
          author_email: userProfile.email || session.user.email,
          status: status || 'published',
        }

        console.log('📝 공지사항 데이터:', noticeData)

        // notices 테이블에 삽입 시도
        const { data: newNotice, error: noticeError } = await supabase
          .from('notices')
          .insert(noticeData)
          .select()
          .single()

        if (noticeError) {
          console.error('❌ 공지사항 삽입 실패:', noticeError)
          console.error('❌ 오류 코드:', noticeError.code)
          console.error('❌ 오류 메시지:', noticeError.message)
          
          // 테이블이 존재하지 않는 경우 (42P01)
          if (noticeError.code === '42P01') {
            console.log('⚠️ notices 테이블이 존재하지 않습니다.')
            const response = {
              success: false, 
              error: 'notices 테이블이 존재하지 않습니다. Supabase 대시보드에서 create-notices-table.sql 파일의 내용을 실행해주세요.',
              tableCreationRequired: true,
              sqlScript: `-- notices 테이블 생성
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' NOT NULL CHECK (priority IN ('normal', 'important')),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_id UUID,
  status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('published', 'draft', 'archived')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- RLS 비활성화 (테스트용)
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;`
            }
            console.log('📤 테이블 생성 필요 응답:', response)
            return NextResponse.json(response, { status: 500 })
          }
          
          // 다른 오류의 경우
          const errorResponse = {
            success: false, 
            error: `공지사항 저장에 실패했습니다: ${noticeError.message}`,
            details: noticeError
          }
          console.log('📤 일반 오류 응답:', errorResponse)
          return NextResponse.json(errorResponse, { status: 500 })
        }

        newItem = newNotice
        break

      default:
        return NextResponse.json({ success: false, error: '지원하지 않는 콘텐츠 타입입니다.' }, { status: 400 })
    }

    console.log('✅ 콘텐츠 저장 완료:', newItem.id)
    return NextResponse.json({ success: true, item: newItem })

  } catch (error: any) {
    console.error('❌ 콘텐츠 생성 오류:', error)
    console.error('❌ 오류 스택:', error.stack)
    
    const errorResponse = {
      success: false, 
      error: error.message || '콘텐츠 생성에 실패했습니다.',
      errorType: error.constructor.name,
      errorDetails: error
    }
    
    console.log('📤 최종 오류 응답:', errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
