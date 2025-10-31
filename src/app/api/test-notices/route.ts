import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🧪 테스트 API 호출됨!')
  
  try {
    const body = await request.json()
    console.log('🧪 테스트 요청 본문:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: '테스트 API 정상 작동',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('🧪 테스트 API 오류:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  console.log('🧪 테스트 GET API 호출됨!')
  return NextResponse.json({ 
    success: true, 
    message: '테스트 GET API 정상 작동',
    timestamp: new Date().toISOString()
  })
}
