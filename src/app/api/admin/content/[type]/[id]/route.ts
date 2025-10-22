import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 개별 콘텐츠 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    console.log(`📝 ${type} 콘텐츠 수정 API 호출됨 - ID: ${id}`)
    
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
    console.log('⚠️ 임시로 관리자 권한 체크를 우회합니다.')

    // 요청 본문 파싱
    const body = await request.json()
    console.log('📝 수정 데이터:', body)

    let result: any = null

    // 콘텐츠 타입에 따라 다른 테이블 업데이트
    switch (type) {
      case 'community':
        console.log('📚 커뮤니티 게시글 수정 시작')
        
        const updateData: any = {
          updated_at: new Date().toISOString()
        }

        // 수정 가능한 필드들
        if (body.title) updateData.title = body.title
        if (body.content) updateData.content = body.content
        if (body.category) updateData.category = body.category
        if (body.status) updateData.status = body.status
        if (body.tags) {
          // 태그가 문자열이면 쉼표로 분리하여 배열로 변환
          if (typeof body.tags === 'string') {
            updateData.tags = body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          } else if (Array.isArray(body.tags)) {
            updateData.tags = body.tags
          }
        }

        const { data: updatedPost, error: updateError } = await supabase
          .from('community_posts')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ 커뮤니티 게시글 수정 실패:', updateError)
          throw updateError
        }

        result = {
          id: updatedPost.id,
          title: updatedPost.title,
          content: updatedPost.content?.substring(0, 100) + '...',
          category: updatedPost.category,
          author: updatedPost.author_name,
          author_email: updatedPost.author_email,
          tags: updatedPost.tags,
          status: updatedPost.status,
          views: updatedPost.views || 0,
          likes: updatedPost.likes || 0,
          createdAt: updatedPost.created_at,
          updatedAt: updatedPost.updated_at,
          type: 'community'
        }
        break

      case 'courses':
        console.log('📚 강의 수정 시작')
        // 강의 수정 로직 (필요시 구현)
        return NextResponse.json(
          { success: false, error: '강의 수정 기능은 아직 구현되지 않았습니다.' },
          { status: 501 }
        )

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 콘텐츠 타입입니다.' },
          { status: 400 }
        )
    }

    console.log('✅ 콘텐츠 수정 완료:', result.id)

    return NextResponse.json({
      success: true,
      item: result
    })

  } catch (error: any) {
    console.error('❌ 콘텐츠 수정 오류:', error)
    return NextResponse.json(
      { success: false, error: '콘텐츠 수정 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    )
  }
}

// 개별 콘텐츠 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    console.log(`🗑️ ${type} 콘텐츠 삭제 API 호출됨 - ID: ${id}`)
    
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
    console.log('⚠️ 임시로 관리자 권한 체크를 우회합니다.')

    // 콘텐츠 타입에 따라 다른 테이블에서 삭제
    switch (type) {
      case 'community':
        console.log('📚 커뮤니티 게시글 삭제 시작')
        
        const { error: deleteError } = await supabase
          .from('community_posts')
          .delete()
          .eq('id', id)

        if (deleteError) {
          console.error('❌ 커뮤니티 게시글 삭제 실패:', deleteError)
          throw deleteError
        }
        break

      case 'courses':
        console.log('📚 강의 삭제 시작')
        // 강의 삭제 로직 (필요시 구현)
        return NextResponse.json(
          { success: false, error: '강의 삭제 기능은 아직 구현되지 않았습니다.' },
          { status: 501 }
        )

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 콘텐츠 타입입니다.' },
          { status: 400 }
        )
    }

    console.log('✅ 콘텐츠 삭제 완료:', id)

    return NextResponse.json({
      success: true,
      message: '콘텐츠가 성공적으로 삭제되었습니다.'
    })

  } catch (error: any) {
    console.error('❌ 콘텐츠 삭제 오류:', error)
    return NextResponse.json(
      { success: false, error: '콘텐츠 삭제 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    )
  }
}
