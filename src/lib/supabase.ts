import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수 검증 및 설정
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '⚠️ Supabase 환경 변수가 설정되지 않았습니다.\n' +
    '다음 환경 변수를 .env.local 파일에 설정해주세요:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
    '- SUPABASE_SERVICE_ROLE_KEY (선택사항)'
  )
}

const finalUrl = supabaseUrl
const finalKey = supabaseKey

console.log('🔧 Supabase 설정:', {
  url: finalUrl,
  keyPrefix: finalKey.substring(0, 20) + '...',
  hasEnvVars: !!(supabaseUrl && supabaseKey)
})

// Supabase 클라이언트 생성
export const supabase = createSupabaseClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// createClient 함수 (API 라우트에서 사용)
export function createClient() {
  // API 라우트에서도 같은 키 사용 (RLS 우회를 위해 서비스 키 우선 사용)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || finalKey
  
  console.log('🔑 API용 Supabase 클라이언트 생성:', {
    url: finalUrl,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    usingServiceKey: serviceKey !== finalKey,
    keyPrefix: serviceKey.substring(0, 20) + '...',
    isServiceRole: serviceKey.includes('service_role')
  })
  
  return createSupabaseClient(finalUrl, serviceKey, {
    auth: {
      autoRefreshToken: serviceKey === finalKey, // anon 키일 때만 세션 관리
      persistSession: serviceKey === finalKey,
      detectSessionInUrl: serviceKey === finalKey
    }
  })
}

// createSupabaseReqResClient 함수 (API 라우트에서 사용)
export function createSupabaseReqResClient(request?: Request) {
  // RLS 우회를 위해 서비스 키 우선 사용
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || finalKey
  
  // 서비스 키가 없는 경우 경고
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.')
    console.warn('RLS 정책으로 인해 일부 작업이 실패할 수 있습니다.')
    console.warn('Supabase 대시보드에서 서비스 키를 확인하고 환경 변수에 설정해주세요.')
  }
  
  console.log('🔑 Request/Response용 Supabase 클라이언트 생성:', {
    url: finalUrl,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    usingServiceKey: serviceKey !== finalKey,
    keyPrefix: serviceKey.substring(0, 20) + '...',
    isServiceRole: serviceKey.includes('service_role'),
    canBypassRLS: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  })
  
  return createSupabaseClient(finalUrl, serviceKey, {
    auth: {
      autoRefreshToken: false, // API 라우트에서는 세션 관리 비활성화
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  })
}

// 연결 테스트 함수
export async function testSupabaseConnection() {
  try {
    // 1295 오류 방지를 위해 간단한 쿼리 사용
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Supabase 연결 테스트 실패:', error.message)
      console.error('오류 코드:', error.code)
      console.error('오류 세부사항:', error.details)
      
      // 1295 오류인 경우 특별 처리
      if (error.code === 'PGRST1295' || error.message.includes('1295')) {
        console.warn('⚠️ MySQL 1295 오류 감지. 더미 데이터 모드로 전환합니다.')
        return false
      }
      
      return false
    }
    
    console.log('✅ Supabase 연결 성공!')
    return true
  } catch (error) {
    console.error('Supabase 연결 오류:', error)
    return false
  }
}
