import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseReqResClient(request)
    
    console.log('🔍 전자책 테이블 디버깅 시작...')
    
    // 1. 테이블 존재 여부 확인
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'ebooks')
    
    console.log('📋 테이블 확인 결과:', { tables, tablesError })
    
    // 2. 모든 전자책 데이터 조회 (상태 무관)
    const { data: allEbooks, error: allError } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('📚 모든 전자책 데이터:', { allEbooks, allError })
    
    // 3. published 전자책만 조회
    const { data: publishedEbooks, error: publishedError } = await supabase
      .from('ebooks')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    console.log('✅ Published 전자책:', { publishedEbooks, publishedError })
    
    return NextResponse.json({
      success: true,
      debug: {
        tableExists: !tablesError && tables && tables.length > 0,
        allEbooks: allEbooks || [],
        allEbooksCount: allEbooks?.length || 0,
        publishedEbooks: publishedEbooks || [],
        publishedEbooksCount: publishedEbooks?.length || 0,
        errors: {
          tablesError,
          allError,
          publishedError
        }
      }
    })
    
  } catch (error) {
    console.error('❌ 전자책 테스트 API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    )
  }
}
