// 데이터베이스 테이블 설정 스크립트
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Supabase 설정 (환경변수 또는 하드코딩된 값 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpejkujtaiqgmbazobjv.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZWprdWp0YWlxZ21iYXpvYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MjQ2NzEsImV4cCI6MjA1MDUwMDY3MX0.Wr9gKYKJlGCOQJ8Uu8Ej6yzKFMdKPPBhfJKFHmJOYJQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🔧 데이터베이스 설정 시작...')
  
  try {
    // SQL 파일 읽기
    const sqlContent = fs.readFileSync('./create-community-table.sql', 'utf8')
    
    console.log('📄 SQL 파일 내용:')
    console.log(sqlContent)
    
    // SQL 실행
    console.log('🚀 SQL 실행 중...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('❌ SQL 실행 실패:', error)
      
      // 개별 SQL 문 실행 시도
      console.log('🔄 개별 SQL 문 실행 시도...')
      const statements = sqlContent.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('📝 실행 중:', statement.trim().substring(0, 50) + '...')
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement.trim() })
            if (stmtError) {
              console.error('❌ 문 실행 실패:', stmtError.message)
            } else {
              console.log('✅ 문 실행 성공')
            }
          } catch (err) {
            console.error('❌ 문 실행 오류:', err.message)
          }
        }
      }
    } else {
      console.log('✅ SQL 실행 성공:', data)
    }
    
    // 테이블 존재 확인
    console.log('🔍 테이블 존재 확인...')
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'community_posts')
    
    if (tableError) {
      console.error('❌ 테이블 확인 실패:', tableError)
    } else if (tables && tables.length > 0) {
      console.log('✅ community_posts 테이블이 존재합니다.')
    } else {
      console.log('⚠️ community_posts 테이블이 존재하지 않습니다.')
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 설정 오류:', error)
  }
}

// 직접 실행
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }
