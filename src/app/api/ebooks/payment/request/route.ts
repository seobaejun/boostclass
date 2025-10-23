import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authorization = request.headers.get('authorization')
    console.log('🔐 결제 API - Authorization 헤더:', authorization ? 'Bearer 토큰 있음' : '토큰 없음')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.log('❌ Authorization 헤더 없음')
      return NextResponse.json({ 
        success: false, 
        error: '로그인이 필요합니다. (토큰 없음)' 
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // 사용자 인증용 클라이언트 (anon key 사용)
    const authSupabase = createSupabaseReqResClient()
    
    // 토큰으로 사용자 정보 가져오기
    const { data: { user }, error: authError } = await authSupabase.auth.getUser(token)
    console.log('🔐 결제 API - 사용자 인증 상태:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      authError: authError?.message 
    })
    
    if (authError || !user) {
      console.log('❌ 인증 실패:', authError?.message || 'No user')
      return NextResponse.json({ 
        success: false, 
        error: '로그인이 필요합니다.',
        debug: {
          authError: authError?.message,
          hasUser: !!user
        }
      }, { status: 401 })
    }

    const { ebookId } = await request.json()

    if (!ebookId) {
      return NextResponse.json({
        success: false,
        error: '전자책 ID가 필요합니다.'
      }, { status: 400 })
    }

    // 데이터베이스 작업용 클라이언트 (서비스 키 사용 - RLS 우회)
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpejkujtaiqgmbazobjv.supabase.co'
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZWprdWp0YWlxZ21iYXpvYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODIwMDAsImV4cCI6MjA3NjE1ODAwMH0.cpFLDyB2QsPEh-8UT5DtXIdIyeN8--Z7V8fdVs3bZII'
    
    const dbSupabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('🔑 데이터베이스 클라이언트 생성:', {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      usingServiceKey: serviceKey !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    // 전자책 정보 조회
    const { data: ebook, error: ebookError } = await dbSupabase
      .from('ebooks')
      .select('id, title, price, is_free, status')
      .eq('id', ebookId)
      .eq('status', 'published')
      .single()

    if (ebookError || !ebook) {
      return NextResponse.json({
        success: false,
        error: '전자책을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 무료 전자책인지 확인
    if (ebook.is_free) {
      return NextResponse.json({
        success: false,
        error: '무료 전자책은 결제가 필요하지 않습니다.'
      }, { status: 400 })
    }

    // 이미 구매했는지 확인
    const { data: existingPurchase } = await dbSupabase
      .from('ebook_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('ebook_id', ebookId)
      .eq('status', 'completed')
      .single()

    if (existingPurchase) {
      return NextResponse.json({
        success: false,
        error: '이미 구매한 전자책입니다.'
      }, { status: 400 })
    }

    // 주문 ID 생성 (강의 결제 시스템과 동일한 방식)
    const orderId = `ebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('📝 주문 ID 생성:', orderId)

    // 구매 내역 생성 (pending 상태) - 기존 테이블 스키마에 맞춤
    const purchaseData = {
      user_id: user.id,
      ebook_id: ebookId,
      order_id: orderId,
      amount: parseInt(ebook.price.toString()), // INTEGER 타입으로 변환
      status: 'pending',
      payment_key: 'pending', // 빈 문자열 대신 'pending'으로 설정
      payment_method: 'toss_payments'
    }
    console.log('📝 구매 내역 데이터:', purchaseData)

    const { data: purchase, error: purchaseError } = await dbSupabase
      .from('ebook_purchases')
      .insert(purchaseData)
      .select()
      .single()

    if (purchaseError) {
      console.error('❌ 구매 내역 생성 오류:', purchaseError)
      console.error('오류 코드:', purchaseError.code)
      console.error('오류 메시지:', purchaseError.message)
      console.error('오류 세부사항:', purchaseError.details)
      
      // 테이블이 없는 경우
      if (purchaseError.code === '42P01') {
        return NextResponse.json({ 
          success: false, 
          error: 'ebook_purchases 테이블이 존재하지 않습니다. 관리자에게 문의하세요.',
          tableRequired: true,
          sqlScript: 'create-ebook-purchases-table-fixed.sql'
        }, { status: 500 })
      }
      
      console.error('구매 내역 생성 실패:', purchaseError)
      return NextResponse.json({
        success: false,
        error: '구매 내역 생성에 실패했습니다.',
        tableRequired: purchaseError.code === '42P01'
      }, { status: 500 })
    }

    console.log('✅ 구매 내역 생성 성공:', purchase)

    // 토스 페이먼츠 결제 정보 반환 - 강의 결제 코드 참고
    return NextResponse.json({
      success: true,
      message: '결제 요청이 생성되었습니다.',
      paymentData: {
        orderId: purchase.order_id,
        orderName: `전자책: ${ebook.title}`,
        amount: ebook.price,
        customerName: user.email?.split('@')[0] || '구매자',
        customerEmail: user.email,
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        failUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/fail`
      },
      purchase: {
        id: purchase.id,
        order_id: purchase.order_id,
        status: purchase.status
      }
    })

  } catch (error: any) {
    console.error('결제 요청 API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '결제 요청 처리 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
