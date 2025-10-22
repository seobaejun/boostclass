import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📢 공개 공지사항 API 호출됨')
    
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // 쿼리 파라미터 추출
    const search = searchParams.get('search') || ''
    const priority = searchParams.get('priority') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    console.log('🔍 검색 파라미터:', { search, priority, page, limit })

    // 기본 쿼리: 발행된 공지사항만 조회
    let query = supabase
      .from('notices')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    // 검색 필터 적용
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,author_name.ilike.%${search}%`)
    }

    // 우선순위 필터 적용
    if (priority) {
      query = query.eq('priority', priority)
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    const { data: notices, error, count } = await query

    if (error) {
      console.error('❌ 공지사항 조회 실패:', error)
      
      // 테이블이 존재하지 않는 경우
      if (error.code === '42P01' || error.code === 'PGRST106') {
        return NextResponse.json({
          success: false,
          error: '공지사항 테이블이 존재하지 않습니다.',
          tableNotFound: true,
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: page
        }, { status: 200 }) // 200으로 반환하여 프론트엔드에서 처리
      }

      return NextResponse.json({
        success: false,
        error: '공지사항을 불러오는데 실패했습니다.',
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    console.log('✅ 공지사항 조회 성공:', {
      count: notices?.length || 0,
      totalItems: count,
      totalPages,
      currentPage: page
    })

    return NextResponse.json({
      success: true,
      items: notices || [],
      totalItems: count || 0,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    })

  } catch (error: any) {
    console.error('❌ 공지사항 API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1
    }, { status: 500 })
  }
}
