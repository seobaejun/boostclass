import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log(`📚 커뮤니티 게시글 상세 조회 API 호출됨 - ID: ${id}`)

    // 게시글 조회
    const { data: post, error } = await supabase
      .from('community_posts')
      .select(`
        id,
        title,
        content,
        category,
        author_name,
        author_email,
        author_id,
        tags,
        status,
        views,
        likes,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ 게시글 조회 실패:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '게시글을 찾을 수 없습니다' },
          { status: 404 }
        )
      }
      throw error
    }

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 조회수 증가
    const { error: updateError } = await supabase
      .from('community_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', id)

    if (updateError) {
      console.warn('⚠️ 조회수 업데이트 실패:', updateError)
    }

    console.log(`✅ 커뮤니티 게시글 상세 조회 완료 - 제목: ${post.title}`)

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        views: (post.views || 0) + 1 // 증가된 조회수 반영
      }
    })

  } catch (error) {
    console.error('❌ 커뮤니티 게시글 상세 조회 중 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시글을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
