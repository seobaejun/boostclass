import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// 동적 라우트로 설정 (request.url 사용으로 인해 정적 렌더링 불가)
export const dynamic = 'force-dynamic'

// Vercel에서 성능 최적화: 캐싱 설정 (60초)
export const revalidate = 60

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 강의 데이터 조회 시작...')
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Supabase 데이터베이스에서 강의 데이터 조회
    console.log('🔍 강의 데이터 조회 (Supabase 데이터베이스)...')
    
    const supabase = createClient()
    
    // Supabase 쿼리 빌더: courses 테이블에서 직접 조회 (categories 조인 제거)
    let query = supabase
      .from('courses')
      .select('*') // categories 조인 제거 (category는 courses 테이블의 TEXT 필드)
      .range(offset, offset + limit - 1)

    // 특별한 카테고리 처리 (실제 테이블 스키마에 맞게)
    if (category === '얼리버드') {
      // 얼리버드 카테고리는 모든 공개 강의 표시
      console.log('🎯 얼리버드 필터 적용: 모든 공개 강의 표시')
    } else if (category === '클래스') {
      // 클래스 카테고리는 유료 강의만 표시 (무료강의 제외)
      query = query.gt('price', 0)
      console.log('🎯 클래스 필터 적용: 유료강의만 표시')
    } else if (category === '무료강의') {
      // 무료강의는 price가 0인 강의만 표시
      query = query.eq('price', 0)
      console.log('🎯 무료강의 필터 적용: 무료강의만 표시')
    }

    // 태그 필터 추가
    if (tag) {
      query = query.contains('tags', [tag])
      console.log('🏷️ 태그 필터 적용:', tag)
    }

    // 검색 필터 (실제 테이블 스키마에 맞게 수정)
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: courses, error } = await query

    if (error) {
      console.error('❌ Supabase 조회 오류:', error)
      console.error('오류 코드:', error.code)
      console.error('오류 메시지:', error.message)
      console.error('오류 세부사항:', error.details)
      console.error('오류 힌트:', error.hint)
      
      return NextResponse.json(
        { success: false, error: '강의 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 전체 개수 조회 (페이지네이션용) - 실제 테이블 스키마에 맞게 수정
    let countQuery = supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      // published 컬럼이 없으므로 제거
      // .eq('published', true)

    if (category === '얼리버드') {
      // 얼리버드는 모든 공개 강의
    } else if (category === '클래스') {
      countQuery = countQuery.gt('price', 0)
    } else if (category === '무료강의') {
      countQuery = countQuery.eq('price', 0)
    }

    if (tag) {
      countQuery = countQuery.contains('tags', [tag])
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { count } = await countQuery

    // courses가 배열인지 확인
    const coursesArray = Array.isArray(courses) ? courses : []

    console.log('✅ Supabase에서 강의 데이터 조회 완료!')
    console.log('📚 조회된 강의 수:', coursesArray.length)
    console.log('🔍 조회된 강의 목록:', coursesArray.map(c => ({ id: c.id, title: c.title, category: c.category, is_featured: c.is_featured })))
    
    // video_url 필드 확인
    console.log('🎬 video_url 필드 확인:')
    coursesArray.forEach((course, index) => {
      console.log(`  강의 ${index + 1}:`, {
        id: course.id,
        title: course.title,
        video_url: course.video_url,
        hasVideoUrl: !!course.video_url,
        videoUrlLength: course.video_url?.length || 0
      })
    })
    
    // video_url이 있는 강의만 필터링
    const coursesWithVideo = coursesArray.filter(course => course.video_url && course.video_url.trim() !== '')
    console.log('📹 video_url이 있는 강의 수:', coursesWithVideo.length)
    
    // video_url 필드 처리 (데이터베이스에 컬럼이 없을 수 있음)
    const processedCourses = coursesArray.map(course => ({
      ...course,
      video_url: course.video_url || null, // video_url이 없으면 null로 설정
      // video_url은 데이터베이스에서 조회됨
    }))
      
    // 반환 시 detail_image_url도 그대로 전달
    return NextResponse.json({
      success: true,
      data: {
        courses: processedCourses.map((c: any) => ({
          ...c,
          category: c.category || '-', // category는 courses 테이블의 직접 필드
          status: c.status || 'draft', // status 필드 사용
          detail_image_url: c.detail_image_url || '', // 확실히 포함!
          original_price: c.original_price || null, // original_price 포함
        })),
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    }, {
      headers: {
        // Vercel 캐싱 최적화: CDN 캐시 60초
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('❌ 강의 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '강의 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
