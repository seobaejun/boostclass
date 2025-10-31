import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('👥 관리자 사용자 목록 조회 요청...')
    
    // 임시로 관리자 권한 확인을 우회 (개발 단계)
    console.log('⚠️ 개발 단계: 관리자 권한 확인을 우회합니다.')

    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    console.log('📊 쿼리 파라미터:', { page, limit, search, role, status })

    // 서비스 키를 사용한 Supabase 클라이언트 (RLS 우회)
    const supabase = createClient()

    // user_profiles 테이블에서 사용자 데이터 조회
    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })

    // 검색 조건 적용
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // 페이지네이션 적용
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data: users, error, count } = await query

    if (error) {
      console.error('❌ 사용자 데이터 조회 오류:', error.message)
      console.error('오류 코드:', error.code)
      console.error('오류 세부사항:', error.details)
      console.error('오류 힌트:', error.hint)
      
      // user_profiles 테이블이 없는 경우 에러 반환
      if (error.code === 'PGRST116' || error.message.includes('relation "user_profiles" does not exist')) {
        console.error('❌ user_profiles 테이블이 존재하지 않습니다.')
        return NextResponse.json(
          { 
            success: false, 
            error: 'user_profiles 테이블이 존재하지 않습니다. 데이터베이스 마이그레이션을 실행해주세요.',
            code: error.code 
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          error: '사용자 데이터를 불러오는 중 오류가 발생했습니다.',
          message: error.message,
          code: error.code 
        },
        { status: 500 }
      )
    }

    console.log('✅ 사용자 데이터 조회 성공:', { count: count || 0, users: users?.length || 0 })
    
    // 실제 데이터가 없는 경우 빈 배열 반환
    if (!users || users.length === 0) {
      console.log('📭 사용자 데이터가 없습니다. 빈 배열을 반환합니다.')
      return NextResponse.json({
        success: true,
        users: [],
        total: 0,
        page,
        totalPages: 0
      })
    }

    // 사용자 데이터 변환
    const formattedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name || user.name || user.email, // full_name 필드 우선 사용
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login_at,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      website: user.website,
      social_links: user.social_links,
      preferences: user.preferences
    })) || []
    
    console.log('📊 변환된 사용자 데이터 샘플:', formattedUsers[0])

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: count || 0,
      page,
      totalPages
    })

  } catch (error) {
    console.error('❌ 관리자 사용자 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '사용자 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('👤 사용자 정보 수정 요청...')
    
    const body = await request.json()
    const { userId, updates } = body

    if (!userId || !updates) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 수정할 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 임시로 관리자 권한 확인을 우회 (개발 단계)
    console.log('⚠️ 개발 단계: 관리자 권한 확인을 우회합니다.')

    console.log('📝 사용자 정보 업데이트:', { userId, updates })
    
    // 서비스 키를 사용한 Supabase 클라이언트 (RLS 우회)
    const supabase = createClient()
    
    // 사용자 정보 업데이트
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        name: updates.name,
        full_name: updates.name,
        email: updates.email,
        role: updates.role,
        is_active: updates.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    console.log('📊 업데이트 결과:', { data, error })

    if (error) {
      console.error('❌ 사용자 정보 수정 오류:', error.message)
      return NextResponse.json(
        { success: false, error: '사용자 정보 수정에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 사용자 정보 수정 성공:', userId)
    console.log('📤 응답 데이터:', { success: true, user: data?.[0] })

    return NextResponse.json({
      success: true,
      user: data?.[0]
    }, { status: 200 })

  } catch (error) {
    console.error('❌ 사용자 정보 수정 오류:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ 사용자 삭제 요청...')
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 임시로 관리자 권한 확인을 우회 (개발 단계)
    console.log('⚠️ 개발 단계: 관리자 권한 확인을 우회합니다.')

    // 서비스 키를 사용한 Supabase 클라이언트 (RLS 우회)
    const supabase = createClient()

    // 사용자 삭제 (실제로는 비활성화)
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('❌ 사용자 삭제 오류:', error.message)
      return NextResponse.json(
        { success: false, error: '사용자 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 사용자 삭제 성공:', userId)

    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다.'
    }, { status: 200 })

  } catch (error) {
    console.error('❌ 사용자 삭제 오류:', error)
    return NextResponse.json(
      { success: false, error: '사용자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
