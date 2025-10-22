// API 테스트 스크립트
const testAPI = async () => {
  try {
    console.log('🔄 API 테스트 시작')
    
    const response = await fetch('http://localhost:3000/api/admin/content/courses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 테스트용으로 인증 헤더 없이 호출
      },
    })
    
    console.log('📥 응답 상태:', response.status)
    console.log('📥 응답 OK:', response.ok)
    
    const data = await response.json()
    console.log('📥 응답 데이터:', data)
    
  } catch (error) {
    console.error('❌ API 테스트 오류:', error)
  }
}

// 브라우저 콘솔에서 실행
testAPI()
