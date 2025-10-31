import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🎓 내 강의 목록 조회 시작...')
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ 인증 토큰이 없습니다.')
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('🔑 토큰 추출 완료')
    
    // Supabase에서 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('❌ 사용자 인증 실패:', userError?.message)
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }
    
    console.log('✅ 사용자 인증 성공:', user.email)

    // 1. 수강신청한 강의 목록 조회 (실제 데이터베이스)
    console.log('🔍 수강신청한 강의 조회 중...')
    
    // 사용자 인증된 클라이언트로 다시 생성
    const { createClient } = await import('@supabase/supabase-js')
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpejkujtaiqgmbazobjv.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZWprdWp0YWlxZ21iYXpvYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODIwMDAsImV4cCI6MjA3NjE1ODAwMH0.cpFLDyB2QsPEh-8UT5DtXIdIyeN8--Z7V8fdVs3bZII',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    const { data: enrollments, error: enrollmentError } = await userSupabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false })

    console.log('📊 수강신청 조회 결과:', { 
      enrollments: enrollments?.length || 0, 
      error: enrollmentError?.message,
      enrollmentData: enrollments?.slice(0, 2) // 처음 2개만 로그
    })

    if (enrollmentError) {
      console.error('❌ 수강신청 조회 실패:', enrollmentError)
    }
    
    console.log('✅ 수강신청 데이터 조회 완료:', enrollments?.length || 0, '개')

    // 1.5. enrollments에 해당하는 courses 조회 (수동 조인)
    let enrollmentCourses = []
    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id)
      console.log('🔍 수강신청 course_ids:', courseIds)

      const { data: courses, error: coursesError } = await userSupabase
        .from('courses')
        .select('*')
        .in('id', courseIds)

      console.log('📊 수강신청 courses 조회:', courses?.length || 0, '개')
      if (coursesError) {
        console.error('❌ 수강신청 courses 조회 실패:', coursesError)
      }

      if (courses) {
        enrollmentCourses = enrollments.map(enrollment => {
          const course = courses.find(c => c.id === enrollment.course_id)
          return {
            ...enrollment,
            course: course
          }
        }).filter(e => e.course) // course가 있는 것만 필터링
      }
    }

    console.log('✅ 수강신청 수동 조인 완료:', enrollmentCourses.length, '개')

    // 2. 구매한 강의 목록 조회 (purchases 테이블)
    console.log('🔍 구매한 강의 조회 중...')
    
    const { data: purchases, error: purchaseError } = await userSupabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (purchaseError) {
      console.error('❌ 구매 내역 조회 실패:', purchaseError)
    }

    // 2.5. purchases에 해당하는 courses 조회 (수동 조인)
    let purchaseCourses = []
    if (purchases && purchases.length > 0) {
      const courseIds = purchases.map(p => p.course_id)
      console.log('🔍 구매 course_ids:', courseIds)

      const { data: courses, error: coursesError } = await userSupabase
        .from('courses')
        .select('*')
        .in('id', courseIds)

      console.log('📊 구매 courses 조회:', courses?.length || 0, '개')
      if (coursesError) {
        console.error('❌ 구매 courses 조회 실패:', coursesError)
      }

      if (courses) {
        purchaseCourses = purchases.map(purchase => {
          const course = courses.find(c => c.id === purchase.course_id)
          return {
            ...purchase,
            course: course
          }
        }).filter(p => p.course) // course가 있는 것만 필터링
      }
    }

    console.log('✅ 구매 수동 조인 완료:', purchaseCourses.length, '개')

    // 2.7. 전자책 구매 내역 조회 (ebook_purchases 테이블 - 유료/무료 모두 포함)
    console.log('🔍 구매한 전자책 조회 중...')
    
    const { data: ebookPurchases, error: ebookPurchaseError } = await userSupabase
      .from('ebook_purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })

    if (ebookPurchaseError) {
      console.error('❌ 전자책 구매 내역 조회 실패:', ebookPurchaseError)
    }

    // 2.8. ebook_purchases에 해당하는 ebooks 조회 (수동 조인)
    let purchaseEbooks = []
    if (ebookPurchases && ebookPurchases.length > 0) {
      const ebookIds = ebookPurchases.map(p => p.ebook_id)
      console.log('🔍 구매 ebook_ids:', ebookIds)

      const { data: ebooks, error: ebooksError } = await userSupabase
        .from('ebooks')
        .select('*')
        .in('id', ebookIds)

      console.log('📊 구매 ebooks 조회:', ebooks?.length || 0, '개')
      if (ebooksError) {
        console.error('❌ 구매 ebooks 조회 실패:', ebooksError)
      }

      if (ebooks) {
        purchaseEbooks = ebookPurchases.map(purchase => {
          const ebook = ebooks.find(e => e.id === purchase.ebook_id)
          if (ebook) {
            // 전자책을 강의 형태로 변환
            return {
              ...purchase,
              ebook: {
                ...ebook,
                // 강의 형태로 변환
                id: ebook.id,
                title: ebook.title,
                description: ebook.description,
                instructor: ebook.author || '저자',
                category: '전자책',
                price: ebook.price,
                original_price: ebook.price,
                duration: 0, // 전자책은 시간이 없음
                level: 'beginner',
                thumbnail_url: ebook.thumbnail_url,
                created_at: ebook.created_at
              }
            }
          }
          return null
        }).filter(p => p !== null) // null이 아닌 것만 필터링
      }
    }

    console.log('✅ 전자책 수동 조인 완료:', purchaseEbooks.length, '개')

    // 3. 데이터 통합 및 중복 제거
    console.log('🔄 데이터 통합 시작...')
    const myCourses = new Map()
    
    // 수강신청한 강의 추가
    if (enrollmentCourses && enrollmentCourses.length > 0) {
      console.log('📚 수강신청한 강의 처리 중:', enrollmentCourses.length, '개')
      enrollmentCourses.forEach((enrollment: any, index: number) => {
        console.log(`📖 강의 ${index + 1}:`, {
          enrollment_id: enrollment.id,
          course_id: enrollment.course_id,
          course_title: enrollment.course?.title,
          status: enrollment.status
        })
        
        if (enrollment.course) {
          myCourses.set(enrollment.course.id, {
            ...enrollment.course,
            enrollment_id: enrollment.id,
            enrollment_status: enrollment.status,
            enrolled_at: enrollment.enrolled_at,
            progress_percentage: enrollment.progress_percentage,
            type: 'enrollment'
          })
        }
      })
    } else {
      console.log('⚠️ 수강신청한 강의가 없습니다.')
    }
    
    // 구매한 강의 추가 (중복되지 않는 경우만)
    if (purchaseCourses) {
      purchaseCourses.forEach((purchase: any) => {
        if (purchase.course && !myCourses.has(purchase.course.id)) {
          myCourses.set(purchase.course.id, {
            ...purchase.course,
            purchase_id: purchase.id,
            purchase_amount: purchase.amount,
            purchased_at: purchase.created_at,
            type: 'purchase'
          })
        }
      })
    }

    // 구매한 전자책 추가 (중복되지 않는 경우만)
    if (purchaseEbooks) {
      console.log('📚 구매한 전자책 처리 중:', purchaseEbooks.length, '개')
      purchaseEbooks.forEach((purchase: any, index: number) => {
        console.log(`📖 전자책 ${index + 1}:`, {
          purchase_id: purchase.id,
          ebook_id: purchase.ebook_id,
          ebook_title: purchase.ebook?.title,
          status: purchase.status
        })
        
        if (purchase.ebook && !myCourses.has(purchase.ebook.id)) {
          myCourses.set(purchase.ebook.id, {
            ...purchase.ebook,
            purchase_id: purchase.id,
            purchase_amount: purchase.amount,
            purchased_at: purchase.purchased_at,
            type: purchase.ebook.is_free ? 'free_ebook' : 'paid_ebook', // 무료/유료 전자책 구분
            content_type: 'ebook' // 전자책임을 구분하기 위한 필드
          })
        }
      })
    }

    const courses = Array.from(myCourses.values())
    
    console.log('✅ 내 강의 목록 조회 완료:', courses.length, '개 강의')
    console.log('📋 최종 강의 목록:', courses.map(c => ({ 
      id: c.id, 
      title: c.title, 
      type: c.type,
      enrollment_id: c.enrollment_id,
      purchase_id: c.purchase_id
    })))
    
    return NextResponse.json({
      success: true,
      data: courses,
      count: courses.length
    })

  } catch (error) {
    console.error('❌ 내 강의 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '내 강의 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
