import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📚 전자책 API 호출 시작...')
    const supabase = createSupabaseReqResClient(request)
    
    console.log('🔑 Supabase 클라이언트 생성 완료')
    
    // 먼저 모든 전자책 데이터 확인
    const { data: allEbooks, error: allError } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('📋 모든 전자책 데이터:', {
      count: allEbooks?.length || 0,
      data: allEbooks,
      error: allError
    })
    
    // published 상태인 전자책만 가져오기
    const { data: ebooks, error } = await supabase
      .from('ebooks')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    console.log('✅ Published 전자책 데이터:', {
      count: ebooks?.length || 0,
      data: ebooks,
      error: error
    })
    
    if (error) {
      console.error('❌ 전자책 데이터 조회 오류:', error)
      
      // ebooks 테이블이 존재하지 않는 경우
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          ebooks: [],
          message: 'ebooks 테이블이 존재하지 않습니다. 관리자 페이지에서 전자책을 업로드해주세요.'
        })
      }
      
      throw error
    }
    
    console.log('🎉 전자책 API 성공:', { count: ebooks?.length || 0 })
    
    return NextResponse.json({
      success: true,
      ebooks: ebooks || [],
      debug: {
        totalCount: allEbooks?.length || 0,
        publishedCount: ebooks?.length || 0
      }
    })
    
  } catch (error) {
    console.error('전자책 API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '전자책 데이터를 가져오는데 실패했습니다.' 
      },
      { status: 500 }
    )
  }
}
