import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 댓글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log(`💬 댓글 조회 API 호출됨 - 게시글 ID: ${id}`)

    // 댓글 조회
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        author_name,
        author_email,
        author_id,
        likes,
        created_at,
        updated_at
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ 댓글 조회 실패:', error)
      // 테이블이 존재하지 않는 경우 빈 배열 반환
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('⚠️ comments 테이블이 존재하지 않습니다.')
        return NextResponse.json({
          success: true,
          comments: []
        })
      }
      throw error
    }

    console.log(`✅ 댓글 조회 완료: ${comments?.length || 0} 건`)

    return NextResponse.json({
      success: true,
      comments: comments || []
    })

  } catch (error) {
    console.error('❌ 댓글 조회 중 오류:', error)
    return NextResponse.json(
      { success: false, error: '댓글을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log(`✍️ 댓글 작성 API 호출됨 - 게시글 ID: ${id}`)

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

    // 사용자 프로필에서 이름 가져오기
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    const authorName = profile?.name || user.email?.split('@')[0] || '익명'

    // 요청 본문 파싱
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 댓글 데이터 준비
    const commentData = {
      post_id: id,
      content: content.trim(),
      author_name: authorName,
      author_email: user.email,
      author_id: user.id,
      likes: 0
    }

    console.log('💬 댓글 데이터:', commentData)

    // 댓글 저장 (RLS 정책 우회를 위해 서비스 키 사용)
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert(commentData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ 댓글 저장 실패:', insertError)
      
      // 테이블이 존재하지 않는 경우 - 자동 생성 시도
      if (insertError.code === '42P01') {
        console.log('⚠️ comments 테이블이 존재하지 않습니다. 자동 생성을 시도합니다.')
        
        try {
          // 간단한 댓글 테이블 생성
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS comments (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              post_id UUID NOT NULL,
              author_name TEXT NOT NULL,
              author_email TEXT NOT NULL,
              author_id UUID,
              content TEXT NOT NULL,
              likes INTEGER DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
            );
            
            CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
            ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
          `
          
          const { error: createError } = await supabase.rpc('exec', { sql: createTableSQL })
          
          if (createError) {
            console.error('❌ 테이블 생성 실패:', createError)
            return NextResponse.json(
              { success: false, error: '댓글 테이블 생성에 실패했습니다.' },
              { status: 500 }
            )
          }
          
          console.log('✅ comments 테이블이 생성되었습니다. 댓글 저장을 재시도합니다.')
          
          // 테이블 생성 후 다시 댓글 저장 시도
          const { data: retryComment, error: retryError } = await supabase
            .from('comments')
            .insert(commentData)
            .select()
            .single()
          
          if (retryError) {
            throw retryError
          }
          
          console.log('✅ 댓글 저장 완료 (재시도):', retryComment.id)
          
          return NextResponse.json({
            success: true,
            comment: retryComment
          })
          
        } catch (createTableError) {
          console.error('❌ 테이블 생성 및 댓글 저장 실패:', createTableError)
          return NextResponse.json(
            { success: false, error: '댓글 테이블이 존재하지 않습니다. 수동으로 생성해주세요.' },
            { status: 500 }
          )
        }
      }
      
      // RLS 정책 오류인 경우
      if (insertError.code === '42501') {
        return NextResponse.json(
          { success: false, error: '댓글 작성 권한이 없습니다. 댓글 테이블 설정을 확인해주세요.' },
          { status: 403 }
        )
      }
      
      throw insertError
    }

    console.log('✅ 댓글 저장 완료:', comment.id)

    return NextResponse.json({
      success: true,
      comment: comment
    })

  } catch (error) {
    console.error('❌ 댓글 작성 중 오류:', error)
    return NextResponse.json(
      { success: false, error: '댓글 작성에 실패했습니다' },
      { status: 500 }
    )
  }
}
