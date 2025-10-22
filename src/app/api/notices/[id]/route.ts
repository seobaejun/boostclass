import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📢 공지사항 상세 API 호출됨, ID:', id)
    
    const supabase = createClient()

    // 공지사항 조회 및 조회수 증가
    const { data: notice, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .eq('status', 'published') // 발행된 공지사항만
      .single()

    if (error) {
      console.error('❌ 공지사항 조회 실패:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: '공지사항을 찾을 수 없습니다.'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: false,
        error: '공지사항을 불러오는데 실패했습니다.'
      }, { status: 500 })
    }

    // 조회수 증가
    const { error: updateError } = await supabase
      .from('notices')
      .update({ views: (notice.views || 0) + 1 })
      .eq('id', id)

    if (updateError) {
      console.warn('⚠️ 조회수 업데이트 실패:', updateError)
      // 조회수 업데이트 실패는 치명적이지 않으므로 계속 진행
    }

    console.log('✅ 공지사항 상세 조회 성공:', notice.title)

    return NextResponse.json({
      success: true,
      notice: {
        ...notice,
        views: (notice.views || 0) + 1 // 증가된 조회수 반영
      }
    })

  } catch (error: any) {
    console.error('❌ 공지사항 상세 API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
