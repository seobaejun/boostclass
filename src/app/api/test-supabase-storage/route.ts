import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseReqResClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Supabase Storage 연결 테스트...')
    
    const supabase = createSupabaseReqResClient(request)
    
    // 1. Supabase 연결 테스트
    console.log('1. Supabase 기본 연결 테스트...')
    const { data: testData, error: testError } = await supabase
      .from('ebooks')
      .select('count', { count: 'exact', head: true })
    
    if (testError) {
      console.error('Supabase 연결 오류:', testError)
      return NextResponse.json({
        success: false,
        error: `Supabase 연결 실패: ${testError.message}`,
        step: 'database_connection'
      })
    }
    
    console.log('✅ Supabase 데이터베이스 연결 성공')
    
    // 2. Storage 버킷 목록 조회
    console.log('2. Storage 버킷 목록 조회...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Storage 버킷 조회 오류:', bucketsError)
      return NextResponse.json({
        success: false,
        error: `Storage 버킷 조회 실패: ${bucketsError.message}`,
        step: 'storage_buckets'
      })
    }
    
    console.log('✅ Storage 버킷 목록:', buckets?.map(b => b.name))
    
    // 3. ebook-files 버킷 확인
    const ebookBucket = buckets?.find(b => b.name === 'ebook-files')
    if (!ebookBucket) {
      return NextResponse.json({
        success: false,
        error: 'ebook-files 버킷이 존재하지 않습니다.',
        step: 'ebook_bucket_check',
        availableBuckets: buckets?.map(b => b.name) || []
      })
    }
    
    console.log('✅ ebook-files 버킷 존재 확인')
    
    // 4. Storage 파일 목록 조회 (테스트)
    console.log('3. ebook-files 버킷 파일 목록 조회...')
    const { data: files, error: filesError } = await supabase.storage
      .from('ebook-files')
      .list('', { limit: 5 })
    
    if (filesError) {
      console.error('Storage 파일 목록 조회 오류:', filesError)
      return NextResponse.json({
        success: false,
        error: `Storage 파일 목록 조회 실패: ${filesError.message}`,
        step: 'storage_files'
      })
    }
    
    console.log('✅ Storage 파일 목록 조회 성공:', files?.length, '개 파일')
    
    return NextResponse.json({
      success: true,
      message: 'Supabase Storage 연결 테스트 성공!',
      data: {
        databaseConnection: true,
        buckets: buckets?.map(b => ({ name: b.name, id: b.id })),
        ebookBucket: ebookBucket,
        fileCount: files?.length || 0
      }
    })
    
  } catch (error) {
    console.error('❌ Supabase Storage 테스트 오류:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      step: 'general_error'
    }, { status: 500 })
  }
}
