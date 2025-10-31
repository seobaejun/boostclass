'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { CreditCard, Shield, Clock, CheckCircle, ArrowLeft } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  price: number
  thumbnail_url?: string
  instructor: string
  duration: number
  level: string
  category: string
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const courseId = searchParams.get('courseId')
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (!courseId) {
      router.push('/courses')
      return
    }
    
    fetchCourse()
    loadTossPaymentsScript()
  }, [user, courseId])

  const loadTossPaymentsScript = () => {
    // 이미 스크립트가 로드되었는지 확인
    if (typeof window !== 'undefined' && (window as any).TossPayments) {
      console.log('✅ 토스페이먼츠 스크립트 이미 로드됨')
      return
    }

    // 스크립트가 이미 DOM에 있는지 확인
    const existingScript = document.querySelector('script[src="https://js.tosspayments.com/v1/payment"]')
    if (existingScript) {
      console.log('✅ 토스페이먼츠 스크립트 이미 DOM에 존재')
      return
    }

    // 스크립트 동적 로드
    console.log('🔄 토스페이먼츠 스크립트 로딩 시작...')
    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v1/payment'
    script.async = true
    script.onload = () => {
      console.log('✅ 토스페이먼츠 스크립트 로드 완료')
    }
    script.onerror = () => {
      console.error('❌ 토스페이먼츠 스크립트 로드 실패')
    }
    document.head.appendChild(script)
  }

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses`)
      const data = await response.json()

      if (data.success && data.data.courses) {
        const foundCourse = data.data.courses.find((c: any) => c.id === courseId)
        if (foundCourse) {
          setCourse(foundCourse)
        } else {
          router.push('/courses')
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      router.push('/courses')
    } finally {
      setLoading(false)
    }
  }

  const waitForTossPayments = (): Promise<typeof window.TossPayments> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.TossPayments) {
        resolve(window.TossPayments)
        return
      }

      let attempts = 0
      const maxAttempts = 50 // 5초 대기
      
      const checkTossPayments = () => {
        attempts++
        
        if (typeof window !== 'undefined' && window.TossPayments) {
          resolve(window.TossPayments)
        } else if (attempts >= maxAttempts) {
          reject(new Error('토스페이먼츠 스크립트 로딩에 실패했습니다.'))
        } else {
          setTimeout(checkTossPayments, 100)
        }
      }
      
      checkTossPayments()
    })
  }

  const handlePayment = async () => {
    if (!user || !course) return

    setProcessing(true)
    try {
      // 토스페이먼츠 스크립트 로딩 대기
      console.log('🔄 토스페이먼츠 스크립트 로딩 대기 중...')
      const TossPayments = await waitForTossPayments()
      console.log('✅ 토스페이먼츠 스크립트 로딩 완료')

      // 토스페이먼츠 결제 요청
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('로그인이 필요합니다.')
        return
      }

      // 결제 요청 API 호출
      const response = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          courseId: course.id,
          amount: course.price,
          orderName: course.title,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 토스페이먼츠 결제 위젯 초기화
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_P9BRQmyarYymBN4obxjNrJ07KzLN'
        
        console.log('💳 토스페이먼츠 결제 위젯 초기화:', clientKey)
        const tossPayments = TossPayments(clientKey)
        
        await tossPayments.requestPayment('카드', {
          amount: course.price,
          orderId: data.orderId,
          orderName: course.title,
          customerName: user.email,
          successUrl: `${window.location.origin}/payment/success?orderId=${data.orderId}&courseId=${course.id}`,
          failUrl: `${window.location.origin}/payment/fail`,
        })
      } else {
        alert('결제 요청 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('결제 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`
    }
    return `${remainingSeconds}초`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              강의를 찾을 수 없습니다
            </h1>
            <Link
              href="/courses"
              className="text-blue-600 hover:text-blue-500"
            >
              강의 목록으로 돌아가기
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            강의 상세로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">결제하기</h1>
          <p className="text-gray-600 mt-2">안전하고 빠른 결제를 진행해주세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 강의 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">주문 상품</h2>
            
            <div className="flex items-start space-x-4">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                  {course.title.charAt(0)}
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{course.instructor}</span>
                  <span>•</span>
                  <span>{formatDuration(course.duration)}</span>
                  <span>•</span>
                  <span>{course.level}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">총 결제금액</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(course.price)}
                </span>
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구매자 정보
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  결제 수단
                </label>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-900">신용카드</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">안전한 결제</span>
                </div>
                <p className="text-xs text-blue-700">
                  토스페이먼츠를 통해 안전하게 결제됩니다.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">테스트 환경</span>
                </div>
                <p className="text-xs text-yellow-700">
                  현재 테스트 모드입니다. 실제 결제가 발생하지 않습니다.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    결제 처리 중...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    {formatPrice(course.price)} 결제하기
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 text-center">
                결제 진행 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
              </div>
            </div>
          </div>
        </div>

        {/* 결제 안내 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 안내</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">즉시 결제</h4>
                <p className="text-sm text-gray-600">결제 완료 즉시 강의를 수강할 수 있습니다.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">안전한 결제</h4>
                <p className="text-sm text-gray-600">토스페이먼츠의 보안 시스템을 통해 안전하게 결제됩니다.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">평생 수강</h4>
                <p className="text-sm text-gray-600">구매한 강의는 평생 동안 수강할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
