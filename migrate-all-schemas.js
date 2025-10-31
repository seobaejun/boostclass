// Supabase 스키마 전체 마이그레이션 스크립트
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const https = require('https')

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
  console.error('.env.local 파일에 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.')
  process.exit(1)
}

// SQL 파일 실행 순서 정의
const migrationFiles = [
  {
    name: 'ebooks 테이블',
    file: 'create-ebooks-table.sql',
    description: '전자책 테이블 생성'
  },
  {
    name: 'ebook_purchases 테이블',
    file: 'create-ebook-purchases-table-fixed.sql',
    description: '전자책 구매 테이블 생성'
  },
  {
    name: 'enrollments 테이블',
    file: 'create-enrollments-table.sql',
    description: '수강신청 테이블 생성'
  },
  {
    name: 'community_posts 테이블',
    file: 'create-community-table.sql',
    description: '커뮤니티 게시글 테이블 생성'
  },
  {
    name: 'comments 테이블',
    file: 'create-comments-table.sql',
    description: '댓글 테이블 생성'
  },
  {
    name: 'notices 테이블',
    file: 'create-notices-table-fixed.sql',
    description: '공지사항 테이블 생성'
  }
]

// Supabase REST API를 통한 SQL 실행
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(supabaseUrl)
    const projectRef = url.hostname.split('.')[0]
    const sqlApiUrl = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`
    
    // Supabase는 exec_sql 함수가 없으므로, 직접 POST 요청으로 SQL 실행
    // 대신 Supabase Management API를 사용하거나 pg 라이브러리 필요
    
    // 여기서는 간단하게 SQL을 반환하여 사용자가 직접 실행할 수 있도록 함
    resolve(sql)
  })
}

// 통합 마이그레이션 파일 생성 및 Supabase REST API로 실행 시도
async function migrateAllSchemas() {
  console.log('🚀 Supabase 스키마 마이그레이션 시작\n')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log(`🔑 Service Key: ${supabaseServiceKey ? '설정됨 (' + supabaseServiceKey.substring(0, 20) + '...)' : '설정 안됨'}\n`)
  
  let allSQL = `-- ============================================\n`
  allSQL += `-- Supabase 전체 스키마 마이그레이션\n`
  allSQL += `-- 생성 시간: ${new Date().toLocaleString('ko-KR')}\n`
  allSQL += `-- ============================================\n\n`
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  // 기존 테이블 확인
  console.log('🔍 기존 테이블 확인 중...\n')
  const tableNames = ['ebooks', 'ebook_purchases', 'enrollments', 'community_posts', 'comments', 'notices']
  
  for (const tableName of tableNames) {
    try {
      const { error } = await supabase.from(tableName).select('*').limit(0)
      if (error && (error.code === 'PGRST204' || error.message.includes('does not exist'))) {
        console.log(`  ⚠️  ${tableName}: 존재하지 않음`)
      } else {
        console.log(`  ✅ ${tableName}: 이미 존재함`)
      }
    } catch (err) {
      console.log(`  ⚠️  ${tableName}: 확인 중 오류`)
    }
  }
  
  console.log('\n📋 마이그레이션 파일 처리 중...\n')
  
  for (const migration of migrationFiles) {
    const filePath = path.join(__dirname, migration.file)
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  파일을 찾을 수 없습니다: ${migration.file}`)
      continue
    }
    
    const sql = fs.readFileSync(filePath, 'utf-8')
    allSQL += `\n-- ============================================\n`
    allSQL += `-- ${migration.name}: ${migration.description}\n`
    allSQL += `-- 파일: ${migration.file}\n`
    allSQL += `-- ============================================\n\n`
    allSQL += sql
    allSQL += `\n\n`
    
    console.log(`✅ ${migration.name}: 추가됨`)
  }
  
  // 통합 SQL 파일 저장
  const outputFile = path.join(__dirname, 'all-migrations.sql')
  fs.writeFileSync(outputFile, allSQL, 'utf-8')
  
  console.log(`\n✅ 통합 마이그레이션 파일 생성 완료: ${outputFile}`)
  console.log(`\n📝 다음 단계:`)
  console.log(`1. Supabase 대시보드 접속:`)
  console.log(`   ${supabaseUrl.replace('/rest/v1', '').replace('/storage/v1', '')}`)
  console.log(`2. 왼쪽 메뉴에서 "SQL Editor" 클릭`)
  console.log(`3. "New Query" 버튼 클릭`)
  console.log(`4. 아래 명령으로 파일 내용 확인:`)
  console.log(`   type ${outputFile}`)
  console.log(`5. 파일 내용을 복사하여 SQL Editor에 붙여넣기`)
  console.log(`6. "Run" 버튼 클릭하여 실행\n`)
  
  return outputFile
}

// 메인 실행
async function main() {
  try {
    const migrationFile = await migrateAllSchemas()
    console.log(`✅ 마이그레이션 준비 완료!`)
    console.log(`\n📄 생성된 파일: ${migrationFile}`)
    console.log(`\n💡 자동 실행을 원하시면 Supabase CLI를 설치하고 다음 명령을 실행하세요:`)
    console.log(`   npm install -g supabase`)
    console.log(`   supabase login`)
    console.log(`   supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" --file ${migrationFile}\n`)
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()
