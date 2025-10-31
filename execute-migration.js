// Supabase PostgreSQL 직접 연결을 통한 마이그레이션 실행
const { Client } = require('pg')
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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.')
  process.exit(1)
}

// Supabase URL에서 프로젝트 참조 추출
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '').replace('/rest/v1', '').replace('/storage/v1', '')

console.log('🚀 Supabase 스키마 마이그레이션 실행\n')
console.log(`📍 프로젝트: ${projectRef}`)
console.log(`📍 URL: ${supabaseUrl}\n`)

// PostgreSQL 연결 문자열 구성
// Supabase 대시보드 > Settings > Database > Connection string에서 확인 필요
// 형식: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

console.log('⚠️  PostgreSQL 직접 연결을 위해서는 데이터베이스 연결 문자열이 필요합니다.')
console.log('\n📋 Supabase 대시보드에서 연결 정보 확인 방법:')
console.log('1. Supabase 대시보드 접속:')
console.log(`   ${supabaseUrl.replace('/rest/v1', '').replace('/storage/v1', '')}`)
console.log('\n2. Settings > Database 메뉴 클릭')
console.log('\n3. Connection string 섹션에서 다음 정보 확인:')
console.log('   - Host')
console.log('   - Database')
console.log('   - Port')
console.log('   - Password (프로젝트 생성 시 설정한 비밀번호)')
console.log('\n4. .env.local 파일에 추가:')
console.log('   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres')
console.log('\n또는')
console.log('\n📝 더 간단한 방법: SQL Editor 사용\n')
console.log('1. Supabase 대시보드 > SQL Editor 접속')
console.log('2. New Query 클릭')
console.log('3. all-migrations.sql 파일 내용을 복사하여 붙여넣기')
console.log('4. Run 버튼 클릭\n')

// all-migrations.sql 파일 확인
const migrationFile = path.join(__dirname, 'all-migrations.sql')
if (fs.existsSync(migrationFile)) {
  const stats = fs.statSync(migrationFile)
  const content = fs.readFileSync(migrationFile, 'utf-8')
  console.log(`✅ 마이그레이션 파일 준비됨:`)
  console.log(`   - 파일: ${migrationFile}`)
  console.log(`   - 크기: ${(stats.size / 1024).toFixed(2)} KB`)
  console.log(`   - 라인 수: ${content.split('\\n').length}\n`)
  
  console.log('📄 파일 미리보기 (처음 20줄):')
  console.log('─'.repeat(60))
  content.split('\\n').slice(0, 20).forEach((line, i) => {
    console.log(`${(i + 1).toString().padStart(3, ' ')} | ${line}`)
  })
  console.log('─'.repeat(60))
  console.log('   ...\n')
}

// 데이터베이스 연결 문자열이 있는 경우 직접 실행 시도
const databaseUrl = env.DATABASE_URL

if (databaseUrl) {
  console.log('🔗 PostgreSQL 직접 연결을 시도합니다...\n')
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  })
  
  async function runMigration() {
    try {
      await client.connect()
      console.log('✅ PostgreSQL 연결 성공!\n')
      
      const sql = fs.readFileSync(migrationFile, 'utf-8')
      
      // SQL을 문장 단위로 분리
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => 
          stmt.length > 0 && 
          !stmt.startsWith('--') && 
          !stmt.toLowerCase().includes('select')
        )
      
      console.log(`📝 ${statements.length}개의 SQL 문장 실행 중...\n`)
      
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        if (statement.length < 10) continue
        
        try {
          await client.query(statement)
          successCount++
          console.log(`  ✅ [${i + 1}/${statements.length}] 실행 완료`)
        } catch (err) {
          errorCount++
          console.error(`  ❌ [${i + 1}/${statements.length}] 오류: ${err.message.substring(0, 100)}`)
          
          // 치명적 오류가 아닌 경우 계속 진행
          if (err.message.includes('already exists') || err.message.includes('does not exist')) {
            console.log(`     ⚠️  경고 무시하고 계속 진행...`)
          }
        }
      }
      
      console.log(`\n✅ 마이그레이션 완료!`)
      console.log(`   성공: ${successCount}개`)
      console.log(`   실패: ${errorCount}개\n`)
      
      await client.end()
    } catch (error) {
      console.error('❌ 마이그레이션 오류:', error.message)
      await client.end()
      process.exit(1)
    }
  }
  
  runMigration().catch(console.error)
} else {
  console.log('⚠️  DATABASE_URL이 설정되지 않아 직접 실행할 수 없습니다.')
  console.log('📝 Supabase 대시보드의 SQL Editor를 통해 실행하세요.\n')
}

