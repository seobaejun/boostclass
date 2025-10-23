import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('📚 전자책 수정 요청...')
    
    const { id } = await params
    const supabase = createSupabaseReqResClient(request)
    const body = await request.json()
    
    console.log('수정할 전자책 ID:', id)
    console.log('수정 데이터:', body)
    
    // 수정할 데이터 준비
    const updateData = {
      title: body.title,
      description: body.description,
      author: body.author,
      category: body.category,
      price: body.price || 0,
      is_free: body.is_free || false,
      status: body.status || 'draft',
      featured: body.featured || false,
      tags: body.tags || [],
      updated_at: new Date().toISOString()
    }
    
    console.log('데이터베이스 업데이트 데이터:', updateData)
    
    // 데이터베이스에서 전자책 정보 업데이트
    const { data: updatedEbook, error } = await supabase
      .from('ebooks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('전자책 데이터베이스 수정 오류:', error)
      
      // ebooks 테이블이 존재하지 않는 경우
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'ebooks 테이블이 존재하지 않습니다.',
          tableRequired: true
        }, { status: 500 })
      }
      
      // 전자책을 찾을 수 없는 경우
      if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
        return NextResponse.json({
          success: false,
          error: '해당 전자책을 찾을 수 없습니다.'
        }, { status: 404 })
      }
      
      throw error
    }
    
    console.log('전자책 수정 성공:', updatedEbook)
    
    return NextResponse.json({
      success: true,
      ebook: updatedEbook,
      message: '전자책이 성공적으로 수정되었습니다.'
    })
    
  } catch (error) {
    console.error('❌ 전자책 수정 오류:', error)
    return NextResponse.json(
      { success: false, error: '전자책 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('📚 전자책 삭제 요청...')
    
    const { id } = await params
    const supabase = createSupabaseReqResClient(request)
    
    console.log('삭제할 전자책 ID:', id)
    
    // 먼저 전자책 정보 조회 (파일 경로 확인용)
    const { data: ebook, error: fetchError } = await supabase
      .from('ebooks')
      .select('file_path')
      .eq('id', id)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('전자책 조회 오류:', fetchError)
      throw fetchError
    }
    
    // Supabase Storage에서 파일 삭제 (파일이 있는 경우)
    if (ebook?.file_path) {
      console.log('Supabase Storage에서 파일 삭제:', ebook.file_path)
      const { error: storageError } = await supabase.storage
        .from('ebook-files')
        .remove([ebook.file_path])
      
      if (storageError) {
        console.error('Supabase Storage 파일 삭제 오류:', storageError)
        // 스토리지 삭제 실패해도 데이터베이스 삭제는 계속 진행
      } else {
        console.log('Supabase Storage 파일 삭제 성공')
      }
    }
    
    // 데이터베이스에서 전자책 삭제
    const { error } = await supabase
      .from('ebooks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('전자책 데이터베이스 삭제 오류:', error)
      
      // ebooks 테이블이 존재하지 않는 경우
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'ebooks 테이블이 존재하지 않습니다.',
          tableRequired: true
        }, { status: 500 })
      }
      
      throw error
    }
    
    console.log('전자책 삭제 성공:', id)
    
    return NextResponse.json({
      success: true,
      message: '전자책이 성공적으로 삭제되었습니다.'
    })
    
  } catch (error) {
    console.error('❌ 전자책 삭제 오류:', error)
    return NextResponse.json(
      { success: false, error: '전자책 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
