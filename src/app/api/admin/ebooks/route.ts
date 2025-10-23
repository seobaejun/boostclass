import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📚 전자책 관리 데이터 조회 요청...')
    
    const supabase = createSupabaseReqResClient(request)
    
    // 전자책 데이터 조회
    const { data: ebooks, error } = await supabase
      .from('ebooks')
      .select(`
        id,
        title,
        description,
        author,
        category,
        file_size,
        file_type,
        download_count,
        price,
        is_free,
        status,
        featured,
        created_at,
        updated_at,
        cover_image,
        tags
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('전자책 데이터 조회 오류:', error)
      console.error('오류 코드:', error.code)
      console.error('오류 메시지:', error.message)
      
      // ebooks 테이블이 존재하지 않는 경우 빈 배열 반환
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('⚠️ ebooks 테이블이 존재하지 않습니다. 빈 배열을 반환합니다.')
        return NextResponse.json({
          success: true,
          ebooks: [],
          message: 'ebooks 테이블이 존재하지 않습니다. 테이블을 생성해주세요.'
        })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: '전자책 데이터를 불러오는 중 오류가 발생했습니다.' 
      }, { status: 500 })
    }

    // 실제 데이터 반환 (빈 배열이어도 그대로 반환)
    return NextResponse.json({
      success: true,
      ebooks: ebooks || []
    })

  } catch (error) {
    console.error('❌ 전자책 목록 조회 오류:', error)
    
    // 오류 발생 시 빈 배열 반환
    return NextResponse.json({
      success: true,
      ebooks: [],
      error: '전자책 목록을 불러오는 중 오류가 발생했습니다.'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📚 전자책 업로드 요청...')
    
    const supabase = createSupabaseReqResClient(request)
    const body = await request.json()
    
    console.log('업로드 데이터:', body)
    
    // UUID 생성
    const ebookId = crypto.randomUUID()
    
    // 전자책 데이터 준비
    const ebookData = {
      id: ebookId,
      title: body.title,
      description: body.description,
      author: body.author,
      category: body.category,
      file_size: body.file_size || 0, // 실제 파일 업로드 시 설정
      file_type: 'PDF',
      download_count: 0,
      price: body.price || 0,
      is_free: body.is_free || false,
      status: 'draft', // 기본값으로 초안 상태
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cover_image: null,
      tags: body.tags || []
    }
    
    console.log('데이터베이스에 저장할 데이터:', ebookData)
    
    // 데이터베이스에 전자책 정보 저장
    const { data: newEbook, error } = await supabase
      .from('ebooks')
      .insert([ebookData])
      .select()
      .single()
    
    if (error) {
      console.error('전자책 데이터베이스 저장 오류:', error)
      
      // ebooks 테이블이 존재하지 않는 경우
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'ebooks 테이블이 존재하지 않습니다. 테이블을 먼저 생성해주세요.',
          tableRequired: true
        }, { status: 500 })
      }
      
      throw error
    }
    
    console.log('전자책 저장 성공:', newEbook)
    
    return NextResponse.json({
      success: true,
      ebook: newEbook,
      message: '전자책이 성공적으로 업로드되었습니다.'
    })
    
  } catch (error) {
    console.error('❌ 전자책 업로드 오류:', error)
    return NextResponse.json(
      { success: false, error: '전자책 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
