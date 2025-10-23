import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('📚 전자책 파일 업로드 요청...')
    console.log('요청 헤더:', Object.fromEntries(request.headers.entries()))
    
    console.log('Supabase 클라이언트 생성 시작...')
    const supabase = createSupabaseReqResClient(request)
    console.log('Supabase 클라이언트 생성 완료')
    
    console.log('FormData 파싱 시작...')
    const formData = await request.formData()
    console.log('FormData 파싱 완료')
    
    // 폼 데이터에서 정보 추출
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const author = formData.get('author') as string
    const category = formData.get('category') as string
    const price = parseInt(formData.get('price') as string) || 0
    const is_free = formData.get('is_free') === 'true'
    const status = formData.get('status') as string || 'draft'
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const file = formData.get('file') as File
    const thumbnailFile = formData.get('thumbnail') as File | null
    const detailImageFile = formData.get('detailImage') as File | null
    
    console.log('업로드 정보:', { title, author, category, price, is_free })
    console.log('파일 정보:', { name: file?.name, size: file?.size, type: file?.type })
    console.log('이미지 파일 정보:', { 
      thumbnail: thumbnailFile ? { name: thumbnailFile.name, size: thumbnailFile.size } : null,
      detailImage: detailImageFile ? { name: detailImageFile.name, size: detailImageFile.size } : null
    })
    
    // 파일 유효성 검사
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'PDF 파일을 선택해주세요.'
      }, { status: 400 })
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: 'PDF 파일만 업로드 가능합니다.'
      }, { status: 400 })
    }
    
    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: '파일 크기는 50MB를 초과할 수 없습니다.'
      }, { status: 400 })
    }
    
    // 필수 필드 검증
    if (!title?.trim() || !description?.trim() || !author?.trim()) {
      return NextResponse.json({
        success: false,
        error: '제목, 설명, 저자는 필수 입력 항목입니다.'
      }, { status: 400 })
    }
    
    // UUID 생성
    const ebookId = crypto.randomUUID()
    const fileName = `${ebookId}.pdf`
    
    // Supabase Storage에 파일 업로드
    console.log('Supabase Storage에 파일 업로드 시작...')
    console.log('🔑 Supabase 클라이언트 정보:', {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    })
    
    const fileBuffer = await file.arrayBuffer()
    
    // 버킷 존재 여부 확인 (권한 문제로 실패할 수 있으므로 경고만 출력)
    console.log('📦 ebook-files 버킷 확인 중...')
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      if (bucketsError) {
        console.warn('⚠️ 버킷 목록 조회 실패 (권한 문제일 수 있음):', bucketsError)
        console.log('🔄 버킷 체크를 건너뛰고 업로드를 시도합니다...')
      } else {
        const ebookBucket = buckets.find(b => b.name === 'ebook-files')
        console.log('📦 ebook-files 버킷 상태:', {
          exists: !!ebookBucket,
          public: ebookBucket?.public,
          bucketInfo: ebookBucket
        })
        
        if (!ebookBucket) {
          console.warn('⚠️ 버킷 목록에서 ebook-files를 찾을 수 없지만 업로드를 시도합니다...')
        }
      }
    } catch (error) {
      console.warn('⚠️ 버킷 확인 중 오류 발생, 업로드를 계속 진행합니다:', error)
    }
    
    // RLS 우회를 위해 서비스 키로 업로드 시도
    console.log('📤 파일 업로드 시작:', { fileName, size: fileBuffer.byteLength })
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ebook-files')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Supabase Storage 업로드 오류:', {
        message: uploadError.message,
        error: uploadError.error,
        statusCode: uploadError.statusCode,
        details: uploadError
      })
      
      // RLS 정책 오류인 경우 특별한 메시지 제공
      if (uploadError.message?.includes('row-level security') || 
          uploadError.message?.includes('policy') ||
          uploadError.statusCode === '42501') {
        return NextResponse.json({
          success: false,
          error: `파일 업로드 실패: RLS 정책 오류입니다. Supabase Storage 버킷 설정을 확인해주세요.`,
          uploadError: uploadError,
          solution: 'SUPABASE_STORAGE_MANUAL_SETUP.md 파일을 참조하여 Storage 버킷과 정책을 설정해주세요.'
        }, { status: 403 })
      }
      
      return NextResponse.json({
        success: false,
        error: `파일 업로드 실패: ${uploadError.message}`
      }, { status: 500 })
    }
    
    console.log('Supabase Storage 업로드 성공:', uploadData)
    
    // 이미지 파일들 업로드
    let thumbnailUrl = null
    let detailImageUrl = null
    
    if (thumbnailFile) {
      console.log('🖼️ 썸네일 이미지 업로드 시작...')
      const thumbnailBuffer = await thumbnailFile.arrayBuffer()
      const thumbnailFileName = `${ebookId}_thumbnail_${Date.now()}.${thumbnailFile.name.split('.').pop()}`
      
      const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
        .from('ebook-thumbnails')
        .upload(thumbnailFileName, thumbnailBuffer, {
          contentType: thumbnailFile.type,
          upsert: false
        })
      
      if (thumbnailUploadError) {
        console.error('썸네일 업로드 오류:', thumbnailUploadError)
      } else {
        console.log('✅ 썸네일 업로드 성공:', thumbnailUploadData)
        // 공개 URL 생성
        const { data: thumbnailPublicData } = supabase.storage
          .from('ebook-thumbnails')
          .getPublicUrl(thumbnailUploadData.path)
        thumbnailUrl = thumbnailPublicData.publicUrl
      }
    }
    
    if (detailImageFile) {
      console.log('🖼️ 상세 이미지 업로드 시작...')
      const detailImageBuffer = await detailImageFile.arrayBuffer()
      const detailImageFileName = `${ebookId}_detail_${Date.now()}.${detailImageFile.name.split('.').pop()}`
      
      const { data: detailImageUploadData, error: detailImageUploadError } = await supabase.storage
        .from('ebook-details')
        .upload(detailImageFileName, detailImageBuffer, {
          contentType: detailImageFile.type,
          upsert: false
        })
      
      if (detailImageUploadError) {
        console.error('상세 이미지 업로드 오류:', detailImageUploadError)
      } else {
        console.log('✅ 상세 이미지 업로드 성공:', detailImageUploadData)
        // 공개 URL 생성
        const { data: detailImagePublicData } = supabase.storage
          .from('ebook-details')
          .getPublicUrl(detailImageUploadData.path)
        detailImageUrl = detailImagePublicData.publicUrl
      }
    }
    
    // 전자책 데이터 준비
    const ebookData = {
      id: ebookId,
      title: title.trim(),
      description: description.trim(),
      author: author.trim(),
      category,
      file_size: file.size,
      file_type: 'PDF',
      file_path: uploadData.path, // Supabase Storage 경로
      download_count: 0,
      price,
      is_free,
      status,
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cover_image: null,
      thumbnail_url: thumbnailUrl,
      detail_image_url: detailImageUrl,
      tags
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
          error: 'ebooks 테이블이 존재하지 않습니다. create-ebooks-table.sql 스크립트를 실행해주세요.',
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
    console.error('❌ 전자책 파일 업로드 오류:', error)
    console.error('오류 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    // 더 구체적인 오류 메시지 제공
    let errorMessage = '전자책 업로드 중 오류가 발생했습니다.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
