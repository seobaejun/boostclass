import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    console.log('👍 좋아요 API 호출됨 - 게시글 ID:', postId)

    // 사용자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('🔑 토큰 추출 완료')

    // 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('❌ 사용자 인증 실패:', userError?.message)
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    console.log('✅ 사용자 인증 성공:', user.email)

    // 사용자의 기존 좋아요 상태 확인 (간단한 방법: 로컬 스토리지 대신 쿠키나 세션 사용)
    // 여기서는 간단하게 게시글의 좋아요 수를 토글하는 방식으로 구현
    
    // 현재 좋아요 수 조회
    const { data: currentPost, error: fetchError } = await supabase
      .from('community_posts')
      .select('likes')
      .eq('id', postId)
      .single()

    if (fetchError) {
      console.error('❌ 게시글 조회 실패:', fetchError)
      throw fetchError
    }

    // 좋아요 토글 (0과 1 사이에서 토글)
    const currentLikes = currentPost.likes || 0
    const newLikes = currentLikes === 0 ? 1 : 0
    
    console.log(`💡 좋아요 토글: ${currentLikes} → ${newLikes}`)

    const { data: updatedPost, error: updateError } = await supabase
      .from('community_posts')
      .update({ likes: newLikes })
      .eq('id', postId)
      .select('likes')
      .single()

    if (updateError) {
      console.error('❌ 좋아요 업데이트 실패:', updateError)
      throw updateError
    }

    console.log('✅ 좋아요 업데이트 완료:', updatedPost.likes)

    return NextResponse.json({
      success: true,
      likes: updatedPost.likes
    })

  } catch (error: any) {
    console.error('❌ 좋아요 처리 중 오류:', error)
    return NextResponse.json(
      { success: false, error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
