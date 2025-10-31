import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Vercel에서 성능 최적화: 캐싱 설정 (60초)
export const revalidate = 60

// 커뮤니티 게시글 조회
export async function GET(request: NextRequest) {
  try {
    console.log('📚 커뮤니티 게시글 조회 API 호출됨')
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🔍 검색 파라미터:', { category, search, tag, limit, offset })

    let query = supabase
      .from('community_posts')
      .select(`
        id,
        title,
        content,
        category,
        author_name,
        author_email,
        tags,
        views,
        likes,
        created_at,
        updated_at
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    // 카테고리 필터
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // 검색어 필터 (제목, 내용, 작성자명에서 검색)
    if (search && search.trim()) {
      const searchTerm = search.trim()
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,author_name.ilike.%${searchTerm}%`)
    }

    // 태그 필터
    if (tag && tag.trim()) {
      query = query.contains('tags', [tag.trim()])
    }

    query = query.range(offset, offset + limit - 1)

    const { data: posts, error: postsError } = await query

    if (postsError) {
      console.error('❌ 커뮤니티 게시글 조회 실패:', postsError.message)
      
      // 테이블이 존재하지 않는 경우 빈 배열 반환
      if (postsError.code === '42P01' || postsError.message.includes('does not exist')) {
        console.log('⚠️ community_posts 테이블이 존재하지 않습니다. 빈 배열을 반환합니다.')
        return NextResponse.json({
          success: true,
          posts: [],
          total: 0,
          message: 'community_posts 테이블이 아직 생성되지 않았습니다.'
        })
      }
      
      return NextResponse.json(
        { success: false, error: '게시글을 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 커뮤니티 게시글 조회 완료:', posts?.length || 0, '건')

    // 각 게시글의 댓글 수 조회
    const postsWithComments = await Promise.all(
      (posts || []).map(async (post) => {
        try {
          // 댓글 수 조회
          const { count: commentCount, error: commentError } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)

          if (commentError && commentError.code !== '42P01') {
            console.error('댓글 수 조회 실패:', commentError)
          }

          return {
            ...post,
            commentCount: commentCount || 0
          }
        } catch (error) {
          console.error('댓글 수 조회 중 오류:', error)
          return {
            ...post,
            commentCount: 0
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      posts: postsWithComments,
      total: postsWithComments?.length || 0
    }, {
      headers: {
        // Vercel 캐싱 최적화: CDN 캐시 60초
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })

  } catch (error: any) {
    console.error('❌ 커뮤니티 게시글 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시글을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 커뮤니티 게시글 작성
export async function POST(request: NextRequest) {
  try {
    console.log('✍️ 커뮤니티 게시글 작성 API 호출됨')
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ 인증 토큰이 없습니다.')
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('🔑 토큰 추출 완료')
    
    // Supabase에서 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('❌ 사용자 인증 실패:', userError?.message)
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }
    
    console.log('✅ 사용자 인증 성공:', user.email)

    // 요청 데이터 파싱
    const body = await request.json()
    const { title, content, category, tags } = body

    // 필수 필드 검증
    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: '제목, 내용, 카테고리는 필수입니다.' },
        { status: 400 }
      )
    }

    // 태그 처리 (문자열을 배열로 변환)
    const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []

    // 게시글 데이터 생성
    const postData = {
      title: title.trim(),
      content: content.trim(),
      category,
      author_name: user.user_metadata?.name || user.email?.split('@')[0] || '익명',
      author_email: user.email,
      author_id: user.id,
      tags: tagsArray,
      status: 'published',
      views: 0,
      likes: 0
    }

    console.log('📝 게시글 데이터:', postData)

    // Supabase에 게시글 저장
    const { data: newPost, error: insertError } = await supabase
      .from('community_posts')
      .insert([postData])
      .select()
      .single()

    if (insertError) {
      console.error('❌ 게시글 저장 실패:', insertError.message)
      
      // 테이블이 존재하지 않는 경우
      if (insertError.code === '42P01' || insertError.message.includes('does not exist')) {
        return NextResponse.json(
          { success: false, error: 'community_posts 테이블이 존재하지 않습니다. 데이터베이스 설정을 확인해주세요.' },
          { status: 500 }
        )
      }
      
      // 컬럼이 존재하지 않는 경우
      if (insertError.code === '42703' || insertError.message.includes('does not exist')) {
        return NextResponse.json(
          { success: false, error: '데이터베이스 스키마가 올바르지 않습니다. 테이블 구조를 확인해주세요.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: '게시글 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 게시글 저장 완료:', newPost.id)

    return NextResponse.json({
      success: true,
      message: '게시글이 성공적으로 작성되었습니다.',
      post: newPost
    })

  } catch (error: any) {
    console.error('❌ 게시글 작성 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
