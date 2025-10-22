'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Play, ArrowRight, Clock } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  instructor: string
  duration: number
  level: string
  category: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const orderId = searchParams.get('orderId')
  const courseId = searchParams.get('courseId')
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchaseData, setPurchaseData] = useState<any>(null)

  const verifyPayment = useCallback(async () => {
    try {
      console.log('🔍 결제 검증 시작:', { orderId, courseId })
      
      // 결제 검증 API 호출
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.log('❌ 세션 토큰 없음')
        router.push('/auth/login')
        return
      }

      console.log('🔑 세션 토큰 확인됨')

      const requestBody = {
        orderId: orderId,
        courseId: courseId,
      }
      
      console.log('📤 API 요청 데이터:', requestBody)

      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📥 API 응답 상태:', response.status)
      const data = await response.json()
      console.log('📥 API 응답 데이터:', data)

      if (data.success) {
        console.log('✅ 결제 검증 성공')
        setPurchaseData(data.purchase)
        setCourse(data.course)
      } else {
        console.log('❌ 결제 검증 실패:', data.error)
        console.log('❌ 오류 상세:', data.details)
        alert(`결제 검증에 실패했습니다: ${data.error}${data.details ? '\n상세: ' + JSON.stringify(data.details) : ''}`)
        router.push('/courses')
      }
    } catch (error) {
      console.error('❌ 결제 검증 오류:', error)
      alert('결제 검증 중 오류가 발생했습니다.')
      router.push('/courses')
    } finally {
      setLoading(false)
    }
  }, [orderId, courseId, user, router])

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (!orderId || !courseId) {
      router.push('/courses')
      return
    }
    
    verifyPayment()
  }, [user, orderId, courseId, verifyPayment])

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

  if (!course || !purchaseData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              결제 정보를 찾을 수 없습니다
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
        {/* 성공 메시지 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">결제가 완료되었습니다!</h1>
          <p className="text-gray-600">강의를 수강할 준비가 되었습니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 구매한 강의 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">구매한 강의</h2>
            
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
                <span className="text-lg font-semibold text-gray-900">결제금액</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(purchaseData.amount)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                결제일: {new Date(purchaseData.created_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          {/* 다음 단계 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">다음 단계</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">강의 시청하기</h3>
                  <p className="text-sm text-gray-600">구매한 강의를 바로 시청할 수 있습니다.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">내 강의에서 확인</h3>
                  <p className="text-sm text-gray-600">내 강의 페이지에서 구매한 강의를 관리할 수 있습니다.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">평생 수강</h3>
                  <p className="text-sm text-gray-600">구매한 강의는 평생 동안 수강할 수 있습니다.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href={`/courses/${course.id}/lessons/1`}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                강의 시청하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              
              <Link
                href="/my-courses"
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                내 강의 보기
              </Link>
            </div>
          </div>
        </div>

        {/* 추가 안내 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">구매 완료 안내</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• 구매한 강의는 내 강의 페이지에서 확인할 수 있습니다.</p>
            <p>• 강의는 언제든지 반복해서 시청할 수 있습니다.</p>
            <p>• 문의사항이 있으시면 고객센터로 연락해주세요.</p>
          </div>
        </div>

        {/* 테스트 환경 안내 */}
        <div className="mt-4 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">테스트 환경 안내</h3>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>• 현재 테스트 모드로 실행 중입니다.</p>
            <p>• 실제 결제가 발생하지 않으며, 테스트 데이터로 처리됩니다.</p>
            <p>• 프로덕션 환경에서는 실제 결제가 진행됩니다.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
