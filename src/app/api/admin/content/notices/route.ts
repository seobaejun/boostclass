import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📢 공지사항 콘텐츠 API 호출됨')
    
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

    // 공지사항 데이터 조회 (현재는 빈 배열 반환)
    // 실제 공지사항 테이블이 있다면 여기서 조회
    const items: any[] = []

    console.log('📈 공지사항 데이터 조회 완료:', items.length, '건')

    return NextResponse.json({
      success: true,
      items: items,
      total: items.length
    })

  } catch (error: any) {
    console.error('❌ 공지사항 콘텐츠 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '공지사항 콘텐츠를 가져오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    )
  }
}
