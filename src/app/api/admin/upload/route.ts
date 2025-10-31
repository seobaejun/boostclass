import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('📤 이미지 업로드 API 시작')
    
    // 서비스 키 확인
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('🔑 서비스 키 확인:', { 
      hasServiceKey,
      keyPrefix: hasServiceKey ? process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...' : '없음'
    })
    
    if (!hasServiceKey) {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. RLS 정책으로 인해 업로드가 실패할 수 있습니다.')
    }
    
    const supabase = createClient();
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') as string;
    
    console.log('📋 업로드 요청 정보:', { 
      hasFile: !!file, 
      fileType: file ? (file as File).type : 'none',
      fileSize: file ? (file as File).size : 0,
      uploadType: type 
    })

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: '파일이 없습니다.' }, { status: 400 });
    }
    if (!type || (type !== 'thumbnail' && type !== 'detail')) {
      return NextResponse.json({ success: false, error: '타입이 잘못되었습니다.' }, { status: 400 });
    }
    if (!(file as File).type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 });
    }
    if ((file as File).size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    const timestamp = Date.now();
    const fileExt = (file as File).name.split('.').pop();
    const fileName = `${type}_${timestamp}.${fileExt}`;
    const arrayBuffer = await (file as File).arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // 버킷명 정책에 따라 course-thumbnails, course-images 둘 다 허용하는 정책 필요
    const bucket = type === 'thumbnail' ? 'course-thumbnails' : 'course-images';
    console.log('🪣 업로드 버킷:', bucket)
    console.log('📁 파일명:', fileName)
    
    // 버킷 존재 확인
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    console.log('🪣 사용 가능한 버킷 목록:', buckets?.map(b => b.name))
    
    if (bucketError) {
      console.error('❌ 버킷 목록 조회 실패:', bucketError)
    }
    
    const bucketExists = buckets?.some(b => b.name === bucket)
    if (!bucketExists) {
      console.error(`❌ ${bucket} 버킷이 존재하지 않습니다.`)
      return NextResponse.json({ 
        success: false, 
        error: `${bucket} 버킷이 존재하지 않습니다. Supabase에서 버킷을 생성해주세요.` 
      }, { status: 500 });
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileData, {
        contentType: (file as File).type,
        upsert: true,
      });
    
    console.log('📤 업로드 결과:', { data, error })
    
    if (error) {
      console.error('❌ 업로드 실패:', {
        message: error.message,
        details: error
      })
      // 버킷이 없을 가능성 체크
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        return NextResponse.json({ 
          success: false, 
          error: `${bucket} 버킷이 존재하지 않습니다. Supabase에서 버킷을 생성해주세요.` 
        }, { status: 500 });
      }
      return NextResponse.json({ success: false, error: `파일 업로드에 실패했습니다: ${error.message}` }, { status: 500 });
    }

    // 업로드된 파일의 public url 반환
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fileName);
    if (!pub || !pub.publicUrl) {
      return NextResponse.json({ success: false, error: 'URL 생성에 실패했습니다.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, url: pub.publicUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
