import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('📚 전자책 다운로드 요청...')
    
    const { id } = await params
    const supabase = createSupabaseReqResClient(request)
    
    console.log('다운로드할 전자책 ID:', id)
    
    // 사용자 인증 확인 (유료 전자책의 경우 필요)
    let user = null
    let authError = null
    
    // Authorization 헤더에서 토큰 추출 (있는 경우에만)
    const authorization = request.headers.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      const authResult = await supabase.auth.getUser(token)
      user = authResult.data.user
      authError = authResult.error
    }
    
    // 전자책 정보 조회
    const { data: ebook, error } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', id)
      .eq('status', 'published') // 발행된 전자책만 다운로드 가능
      .single()
    
    if (error) {
      console.error('전자책 조회 오류:', error)
      
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({
          success: false,
          error: '전자책을 찾을 수 없습니다.'
        }, { status: 404 })
      }
      
      throw error
    }
    
    if (!ebook) {
      return NextResponse.json({
        success: false,
        error: '전자책을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    // 무료 전자책인 경우 로그인 확인 및 구매 기록 생성
    if (ebook.is_free) {
      if (authError || !user) {
        return NextResponse.json({ 
          success: false, 
          error: '로그인이 필요합니다.' 
        }, { status: 401 })
      }

      // 기존 구매 기록 확인
      const { data: existingPurchase } = await supabase
        .from('ebook_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('ebook_id', id)
        .eq('status', 'completed')
        .single()

      // 구매 기록이 없으면 생성 (무료 전자책)
      if (!existingPurchase) {
        console.log('🆓 무료 전자책 구매 기록 생성 중...')
        
        const { data: newPurchase, error: createError } = await supabase
          .from('ebook_purchases')
          .insert({
            user_id: user.id,
            ebook_id: id,
            order_id: `free_ebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount: 0,
            status: 'completed',
            payment_key: 'free_download',
            payment_method: 'free',
            purchased_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ 무료 전자책 구매 기록 생성 실패:', createError)
          // 구매 기록 생성에 실패해도 다운로드는 허용 (무료이므로)
        } else {
          console.log('✅ 무료 전자책 구매 기록 생성 완료:', newPurchase.id)
        }
      } else {
        console.log('✅ 기존 무료 전자책 구매 기록 확인:', existingPurchase.id)
      }
    } else {
      // 유료 전자책인 경우 구매 확인
      if (authError || !user) {
        return NextResponse.json({ 
          success: false, 
          error: '로그인이 필요합니다.' 
        }, { status: 401 })
      }

      // 구매 내역 확인
      const { data: purchase, error: purchaseError } = await supabase
        .from('ebook_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('ebook_id', id)
        .eq('status', 'completed')
        .single()

      if (purchaseError || !purchase) {
        console.log('구매 내역 없음:', { userId: user.id, ebookId: id })
        return NextResponse.json({
          success: false,
          error: '구매하지 않은 전자책입니다. 먼저 구매해주세요.'
        }, { status: 403 })
      }
      
      console.log('구매 확인 완료:', purchase.id)
    }
    
    console.log('전자책 정보:', { title: ebook.title, file_path: ebook.file_path })
    
    // 파일 경로 확인
    if (!ebook.file_path) {
      return NextResponse.json({
        success: false,
        error: '파일 경로가 설정되지 않았습니다.'
      }, { status: 404 })
    }
    
    // Supabase Storage에서 파일 다운로드
    console.log('Supabase Storage에서 파일 다운로드:', ebook.file_path)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('ebook-files')
      .download(ebook.file_path)
    
    if (downloadError) {
      console.error('Supabase Storage 다운로드 오류:', downloadError)
      return NextResponse.json({
        success: false,
        error: `파일 다운로드 실패: ${downloadError.message}`
      }, { status: 404 })
    }
    
    if (!fileData) {
      return NextResponse.json({
        success: false,
        error: '파일을 찾을 수 없습니다.'
      }, { status: 404 })
    }
    
    // 다운로드 수 증가
    await supabase
      .from('ebooks')
      .update({ 
        download_count: ebook.download_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    console.log('다운로드 수 증가:', ebook.download_count + 1)
    
    // 파일 데이터를 Buffer로 변환
    const fileBuffer = Buffer.from(await fileData.arrayBuffer())
    
    // 파일명 설정 (한글 파일명 지원)
    const fileName = `${ebook.title}.pdf`
    const encodedFileName = encodeURIComponent(fileName)
    
    // 파일 응답
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('❌ 전자책 다운로드 오류:', error)
    return NextResponse.json(
      { success: false, error: '파일 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}