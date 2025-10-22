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
        // 공지사항 데이터 조회 (현재는 빈 배열)
        items = []
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
    if (type === 'community' && (search || category !== 'all' || status !== 'all')) {
      // 필터링이 적용된 경우 총 개수를 별도로 조회
      try {
        let countQuery = supabase
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
