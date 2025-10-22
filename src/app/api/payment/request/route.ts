import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const paymentRequestSchema = z.object({
  courseId: z.string(),
  amount: z.number(),
  orderName: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('💳 결제 요청 시작...')
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
    // Supabase에서 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }
    
    console.log('✅ 사용자 인증 성공:', user.email)

    const body = await request.json()
    const { courseId, amount, orderName } = paymentRequestSchema.parse(body)

    // 강의 정보 조회
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()
    
    if (courseError || !course) {
      return NextResponse.json(
        { success: false, error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 기존 구매 내역 확인
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()
    
    if (existingPurchase) {
      return NextResponse.json(
        { success: false, error: '이미 구매한 강의입니다.' },
        { status: 400 }
      )
    }

    // 주문 ID 생성 (타임스탬프 + 랜덤)
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('✅ 주문 ID 생성:', orderId)
    console.log('🔑 토스페이먼츠 테스트 키 사용:', 'test_ck_P9BRQmyarYymBN4obxjNrJ07KzLN')

    // 토스페이먼츠 결제 요청을 위한 데이터 반환
    return NextResponse.json({
      success: true,
      orderId: orderId,
      amount: amount,
      orderName: orderName,
      customerName: user.email,
      customerEmail: user.email,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: '잘못된 입력 데이터입니다.' },
        { status: 400 }
      )
    }

    console.error('Payment request error:', error)
    return NextResponse.json(
      { success: false, error: '결제 요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
