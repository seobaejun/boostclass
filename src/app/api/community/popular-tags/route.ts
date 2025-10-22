import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 인기 태그 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🏷️ 인기 태그 조회 API 호출됨')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // 모든 게시글의 태그를 조회
    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select('tags')
      .eq('status', 'published')
      .not('tags', 'is', null)

    if (postsError) {
      console.error('❌ 태그 조회 실패:', postsError.message)
      
      // 테이블이 존재하지 않는 경우 빈 배열 반환
      if (postsError.code === '42P01' || postsError.message.includes('does not exist')) {
        console.log('⚠️ community_posts 테이블이 존재하지 않습니다. 빈 배열을 반환합니다.')
        return NextResponse.json({
          success: true,
          tags: [],
          message: 'community_posts 테이블이 아직 생성되지 않았습니다.'
        })
      }
      
      return NextResponse.json(
        { success: false, error: '태그를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    // 태그 빈도수 계산
    const tagCount: { [key: string]: number } = {}
    
    posts?.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag && typeof tag === 'string' && tag.trim()) {
            const normalizedTag = tag.trim()
            tagCount[normalizedTag] = (tagCount[normalizedTag] || 0) + 1
          }
        })
      }
    })

    // 빈도수 기준으로 정렬하고 상위 태그만 반환
    const popularTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    console.log('✅ 인기 태그 조회 완료:', popularTags.length, '개')

    return NextResponse.json({
      success: true,
      tags: popularTags
    })

  } catch (error: any) {
    console.error('❌ 인기 태그 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '인기 태그를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
