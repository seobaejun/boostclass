import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 전자책 결제 검증 시작...')
    
    console.log('🔧 Supabase 클라이언트 사용 (lib/supabase.ts)')
    
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
    
    // Supabase 클라이언트 생성 (lib/supabase.ts의 createClient 사용)
    const supabase = createClient()
    
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
    
    const { paymentKey, orderId, amount } = body
    console.log('✅ 파싱된 데이터:', { paymentKey, orderId, amount })

    if (!paymentKey || !orderId || !amount) {
      console.log('❌ 결제 정보 불완전')
      return NextResponse.json({
        success: false,
        error: '결제 정보가 불완전합니다.'
      }, { status: 400 })
    }

    // 토스페이먼츠 테스트 환경에서는 실제 결제 검증을 시뮬레이션
    console.log('🔍 토스페이먼츠 테스트 결제 검증:', { paymentKey, orderId, amount })

    // 구매 내역 조회
    console.log('🔍 구매 내역 조회:', { orderId, userId: user.id })
    const { data: purchase, error: purchaseError } = await supabase
      .from('ebook_purchases')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single()

    console.log('📊 구매 내역 조회 결과:', { purchase: purchase?.id, error: purchaseError?.message })

    if (purchaseError || !purchase) {
      console.log('❌ 구매 내역 조회 실패:', purchaseError?.message)
      return NextResponse.json({
        success: false,
        error: '구매 내역을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 금액 검증
    if (purchase.amount !== amount) {
      console.log('❌ 금액 불일치:', { expected: purchase.amount, received: amount })
      return NextResponse.json({
        success: false,
        error: '결제 금액이 일치하지 않습니다.'
      }, { status: 400 })
    }

    // 실제로는 토스페이먼츠 API를 호출하여 결제 상태를 확인해야 합니다
    // 테스트 환경에서는 시뮬레이션으로 성공 처리
    console.log('💾 구매 내역 업데이트 시작:', { purchaseId: purchase.id, paymentKey, amount })

    // 결제 성공 - 구매 내역 업데이트 (테스트용 시뮬레이션)
    const { error: updateError } = await supabase
      .from('ebook_purchases')
      .update({
        payment_key: paymentKey,
        status: 'completed',
        payment_method: 'card', // 테스트용 기본값
        purchased_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', purchase.id)

    if (updateError) {
      console.error('❌ 구매 내역 업데이트 실패:', updateError)
      return NextResponse.json({
        success: false,
        error: '구매 내역 업데이트에 실패했습니다.'
      }, { status: 500 })
    }
    
    console.log('✅ 구매 내역 업데이트 완료:', purchase.id)

    // 전자책 정보 조회
    console.log('🔍 전자책 정보 조회:', purchase.ebook_id)
    const { data: ebook } = await supabase
      .from('ebooks')
      .select('title')
      .eq('id', purchase.ebook_id)
      .single()

    console.log('📚 전자책 조회 결과:', { title: ebook?.title })

    return NextResponse.json({
      success: true,
      message: '결제가 성공적으로 완료되었습니다.',
      purchase: {
        orderId,
        ebookTitle: ebook?.title || '전자책',
        amount,
        purchasedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ 결제 검증 API 오류:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    })
    
    return NextResponse.json({
      success: false,
      error: '결제 검증 처리 중 오류가 발생했습니다.',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
