import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: '로그인이 필요합니다. (토큰 없음)',
        purchased: false
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    const supabase = createSupabaseReqResClient()
    
    // 토큰으로 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: '로그인이 필요합니다.',
        purchased: false
      }, { status: 401 })
    }

    const { ebookId } = await request.json()

    if (!ebookId) {
      return NextResponse.json({
        success: false,
        error: '전자책 ID가 필요합니다.',
        purchased: false
      }, { status: 400 })
    }

    // 구매 내역 확인
    const { data: purchase, error: purchaseError } = await supabase
      .from('ebook_purchases')
      .select('id, status, purchased_at')
      .eq('user_id', user.id)
      .eq('ebook_id', ebookId)
      .eq('status', 'completed')
      .single()

    if (purchaseError && purchaseError.code !== 'PGRST116') {
      console.error('구매 내역 조회 오류:', purchaseError)
      return NextResponse.json({
        success: false,
        error: '구매 내역 조회 중 오류가 발생했습니다.',
        purchased: false
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      purchased: !!purchase,
      purchaseDate: purchase?.purchased_at || null
    })

  } catch (error: any) {
    console.error('구매 확인 API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '구매 확인 처리 중 오류가 발생했습니다.',
      purchased: false
    }, { status: 500 })
  }
}
