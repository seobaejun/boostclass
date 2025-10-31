// Supabase 마이그레이션 자동 실행 스크립트
// PostgreSQL 연결을 통한 직접 실행

const fs = require('fs')
const path = require('path')

// 환경 변수 로드
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local 파일을 찾을 수 없습니다.')
    return {}
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match) {
        env[match[1].trim()] = match[2].trim()
      }
    }
  })
  
  return env
}

const env = loadEnvFile()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://jlqdzdemcizwnrrhahea.supabase.co'

console.log('🚀 Supabase 스키마 마이그레이션 실행\n')
console.log(`📍 Supabase URL: ${supabaseUrl}\n`)

// Supabase는 직접 SQL 실행을 지원하지 않으므로
// 대시보드 SQL Editor를 통한 실행 안내
console.log('📝 Supabase는 REST API를 통한 직접 SQL 실행을 지원하지 않습니다.')
console.log('따라서 Supabase 대시보드의 SQL Editor를 통해 실행해야 합니다.\n')
console.log('✅ 통합 마이그레이션 파일이 생성되었습니다: all-migrations.sql\n')
console.log('📋 실행 방법:\n')
console.log('1. Supabase 대시보드 접속:')
console.log(`   ${supabaseUrl.replace('/rest/v1', '').replace('/storage/v1', '')}`)
console.log('\n2. 왼쪽 메뉴에서 "SQL Editor" 클릭')
console.log('\n3. "New Query" 버튼 클릭')
console.log('\n4. all-migrations.sql 파일 내용을 복사하여 붙여넣기')
console.log('\n5. "Run" 버튼 클릭하여 실행\n')

// 파일 내용 미리보기
const migrationFile = path.join(__dirname, 'all-migrations.sql')
if (fs.existsSync(migrationFile)) {
  const content = fs.readFileSync(migrationFile, 'utf-8')
  const lineCount = content.split('\n').length
  console.log(`📄 파일 정보:`)
  console.log(`   - 경로: ${migrationFile}`)
  console.log(`   - 크기: ${(fs.statSync(migrationFile).size / 1024).toFixed(2)} KB`)
  console.log(`   - 라인 수: ${lineCount}\n`)
  
  console.log('💡 팁: Windows에서 파일 내용을 보려면:')
  console.log(`   type "${migrationFile}"`)
  console.log(`\n또는 메모장으로 열기:`)
  console.log(`   notepad "${migrationFile}"\n`)
}

console.log('✅ 준비 완료! 위의 단계를 따라 마이그레이션을 실행하세요.\n')

