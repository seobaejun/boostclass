'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface AdminStatus {
  isAdmin: boolean
  role: string
  isActive: boolean
  loading: boolean
  error: string | null
}

export function useAdmin(): AdminStatus {
  const { user } = useAuth()
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isAdmin: false,
    role: 'user',
    isActive: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // 로그인하지 않은 경우
        if (!user?.id || !user?.email) {
          console.log('🔐 [useAdmin] 로그인하지 않은 사용자')
          setAdminStatus({
            isAdmin: false,
            role: 'user',
            isActive: false,
            loading: false,
            error: null
          })
          return
        }

        console.log('🔍 [useAdmin] 관리자 권한 확인 시작:', user.email)

        // 1. 하드코딩된 관리자 이메일 확인 (백업용)
        if (user.email === 'sprince1004@naver.com') {
          console.log('✅ [useAdmin] 하드코딩된 관리자 이메일 확인됨')
          setAdminStatus({
            isAdmin: true,
            role: 'super_admin',
            isActive: true,
            loading: false,
            error: null
          })
          return
        }

        // 2. user_profiles 테이블에서 역할 확인
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role, is_active')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.log('⚠️ [useAdmin] user_profiles 조회 실패:', profileError.message)
            // user_profiles가 없어도 하드코딩된 이메일로 관리자 권한 부여
            if (user.email === 'sprince1004@naver.com') {
              setAdminStatus({
                isAdmin: true,
                role: 'super_admin',
                isActive: true,
                loading: false,
                error: null
              })
              return
            }
          } else if (profile) {
            console.log('📊 [useAdmin] user_profiles 확인:', profile)
            const isAdmin = profile.role === 'admin' && profile.is_active === true
            
            setAdminStatus({
              isAdmin,
              role: profile.role || 'user',
              isActive: profile.is_active || false,
              loading: false,
              error: null
            })
            return
          }
        } catch (dbError) {
          console.error('❌ [useAdmin] DB 조회 오류:', dbError)
          // DB 오류 시 하드코딩된 이메일로 폴백
          if (user.email === 'sprince1004@naver.com') {
            setAdminStatus({
              isAdmin: true,
              role: 'super_admin',
              isActive: true,
              loading: false,
              error: null
            })
            return
          }
        }

        // 기본값: 일반 사용자
        console.log('👤 [useAdmin] 일반 사용자로 설정')
        setAdminStatus({
          isAdmin: false,
          role: 'user',
          isActive: false,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('❌ [useAdmin] 관리자 권한 확인 오류:', error)
        setAdminStatus({
          isAdmin: false,
          role: 'user',
          isActive: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    checkAdminStatus()
  }, [user?.id, user?.email])

  return adminStatus
}
