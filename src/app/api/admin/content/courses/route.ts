import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📚 강의 콘텐츠 API 호출됨')
    
    // Authorization 헤더에서 토큰 추출
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

    // 강의 데이터 조회
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        category,
        instructor,
        price,
        thumbnail_url,
        created_at,
        updated_at,
        status
      `)
      .order('created_at', { ascending: false })

    if (coursesError) {
      console.error('❌ 강의 데이터 조회 실패:', coursesError.message)
      return NextResponse.json(
        { success: false, error: '강의 데이터를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('📈 강의 데이터 조회 완료:', courses?.length || 0, '건')

    // 강의 데이터를 콘텐츠 관리 형식으로 변환
    const items = courses?.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      instructor: course.instructor,
      price: course.price,
      thumbnail: course.thumbnail_url,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      status: course.status || 'active',
      type: 'course'
    })) || []

    return NextResponse.json({
      success: true,
      items: items,
      total: items.length
    })

  } catch (error: any) {
    console.error('❌ 강의 콘텐츠 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '강의 콘텐츠를 가져오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    )
  }
}
