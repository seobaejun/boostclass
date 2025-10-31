import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const paymentVerifySchema = z.object({
  orderId: z.string(),
  courseId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 결제 검증 시작...')
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Authorization 헤더:', authHeader ? '존재' : '없음')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ 인증 토큰 없음')
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('🔑 토큰 추출:', token ? '성공' : '실패')
    
    // Supabase에서 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.log('❌ 사용자 인증 실패:', userError?.message)
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }
    
    console.log('✅ 사용자 인증 성공:', user.email)

    const body = await request.json()
    console.log('📥 요청 본문:', body)
    
    const { orderId, courseId } = paymentVerifySchema.parse(body)
    console.log('✅ 파싱된 데이터:', { orderId, courseId })

    // 토스페이먼츠 테스트 환경에서는 실제 결제 검증을 시뮬레이션
    console.log('🔍 토스페이먼츠 테스트 결제 검증:', { orderId, courseId })
    
    // 실제로는 토스페이먼츠 API를 호출하여 결제 상태를 확인해야 합니다
    // 테스트 환경에서는 시뮬레이션으로 성공 처리
    
    if (!courseId) {
      console.log('❌ 강의 ID 없음')
      return NextResponse.json(
        { success: false, error: '강의 ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // 강의 정보 조회
    console.log('🔍 강의 정보 조회:', courseId)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()
    
    console.log('📊 강의 조회 결과:', { course: course?.title, error: courseError?.message })
    
    if (courseError || !course) {
      console.log('❌ 강의 조회 실패:', courseError?.message)
      return NextResponse.json(
        { success: false, error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 구매 기록 생성 (테스트용 단순화)
    console.log('💾 구매 기록 생성 시작:', { userId: user.id, courseId, amount: course.price })
    
    // 테스트용으로 구매 기록을 생성하지 않고 시뮬레이션
    const mockPurchase = {
      id: `purchase_${Date.now()}`,
      user_id: user.id,
      course_id: courseId,
      amount: course.price || 0,
      status: 'completed',
      order_id: orderId,
      created_at: new Date().toISOString()
    }
    
    console.log('✅ 구매 기록 시뮬레이션 완료:', mockPurchase.id)

    return NextResponse.json({
      success: true,
      purchase: mockPurchase,
      course: course,
      message: '결제가 성공적으로 완료되었습니다.'
    })
  } catch (error) {
    console.error('❌ 결제 검증 오류:', error)
    
    if (error instanceof z.ZodError) {
      console.error('❌ 데이터 검증 오류:', error.issues)
      return NextResponse.json(
        { success: false, error: '잘못된 입력 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '결제 검증 처리 중 오류가 발생했습니다.', details: (error as Error).message },
      { status: 500 }
    )
  }
}
