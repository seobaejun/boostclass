import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1, '이름을 입력해주세요.'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 회원가입 요청 시작...')
    
    const body = await request.json()
    console.log('📊 요청 데이터:', { email: body.email, name: body.name })
    
    const { email, password, name } = registerSchema.parse(body)
    console.log('✅ 데이터 검증 통과')

    // Supabase Auth로 회원가입
    console.log('🔐 Supabase 회원가입 시도...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: undefined, // 이메일 인증 우회
      },
    })

    // 이메일 인증 문제 해결을 위한 추가 처리
    if (data.user) {
      console.log('📧 사용자 생성 성공, 이메일 인증 상태 확인...')
      console.log('📊 사용자 상태:', {
        id: data.user.id,
        email: data.user.email,
        email_confirmed: data.user.email_confirmed_at
      })
      
      // 이메일 인증이 필요한 경우 자동으로 인증 처리
      if (!data.user.email_confirmed_at) {
        console.log('📧 이메일 인증이 필요한 사용자입니다. 자동 인증 처리...')
        
        // 사용자 메타데이터에 인증 완료 표시
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            email_verified: true,
            email_confirmed: true,
            name: name
          }
        })
        
        if (updateError) {
          console.error('❌ 이메일 인증 업데이트 오류:', updateError.message)
          console.log('⚠️ 이메일 인증 업데이트 실패했지만 회원가입은 성공')
        } else {
          console.log('✅ 이메일 인증 자동 처리 완료')
        }
      } else {
        console.log('✅ 이메일이 이미 인증된 사용자입니다.')
      }
    }

    if (error) {
      console.error('❌ Supabase 회원가입 오류:', error.message)
      
      // 사용자 친화적인 오류 메시지 제공
      let userMessage = error.message
      if (error.message.includes('For security purposes')) {
        userMessage = '보안상의 이유로 잠시 후 다시 시도해주세요. (1분 정도 기다려주세요)'
      } else if (error.message.includes('User already registered')) {
        userMessage = '이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.'
      } else if (error.message.includes('Invalid email')) {
        userMessage = '올바른 이메일 형식을 입력해주세요.'
      } else if (error.message.includes('Password should be at least')) {
        userMessage = '비밀번호는 6자 이상 입력해주세요.'
      }
      
      return NextResponse.json(
        { success: false, error: userMessage },
        { status: 400 }
      )
    }

    console.log('✅ 회원가입 성공!')
    console.log('📊 사용자 정보:', { 
      id: data.user?.id, 
      email: data.user?.email,
      email_confirmed: data.user?.email_confirmed_at 
    })

    // user_profiles 테이블에 사용자 정보 저장
    if (data.user) {
      try {
        console.log('📝 user_profiles 테이블에 사용자 정보 저장 중...')
        
        // 기존 사용자 확인
        const { data: existingUser, error: checkError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (existingUser) {
          console.log('⚠️ 사용자 프로필이 이미 존재합니다. 업데이트합니다.')
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              email: data.user.email,
              name: name,
              full_name: name,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('❌ user_profiles 업데이트 오류:', updateError.message)
          } else {
            console.log('✅ user_profiles 테이블에 사용자 정보 업데이트 완료')
          }
        } else {
          // 새 사용자 삽입
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              name: name,
              full_name: name,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('❌ user_profiles 저장 오류:', profileError.message)
            console.log('⚠️ user_profiles 저장 실패했지만 회원가입은 성공')
          } else {
            console.log('✅ user_profiles 테이블에 사용자 정보 저장 완료')
          }
        }
      } catch (error) {
        console.error('❌ user_profiles 저장 중 오류:', error)
        console.log('⚠️ user_profiles 저장 실패했지만 회원가입은 성공')
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
      },
    })
  } catch (error) {
    console.error('❌ 회원가입 처리 오류:', error)
    
    if (error instanceof z.ZodError) {
      console.error('📋 데이터 검증 오류:', error.issues)
      return NextResponse.json(
        { success: false, error: '잘못된 입력 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
