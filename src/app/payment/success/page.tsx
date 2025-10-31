'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Download, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null)

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setError('결제 정보가 올바르지 않습니다.')
      setVerifying(false)
      return
    }

    verifyPayment(paymentKey, orderId, parseInt(amount))
  }, [searchParams])

  const verifyPayment = async (paymentKey: string, orderId: string, amount: number) => {
    try {
      // 사용자 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('로그인이 필요합니다.')
        setVerifying(false)
        return
      }

      const response = await fetch('/api/ebooks/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setPurchaseInfo(data.purchase)
      } else {
        setError(data.error || '결제 검증에 실패했습니다.')
      }
    } catch (error) {
      console.error('결제 검증 오류:', error)
      setError('결제 검증 중 오류가 발생했습니다.')
    } finally {
      setVerifying(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">결제 검증 중</h2>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">결제 실패</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link
                href="/ebooks"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Home className="w-4 h-4 mr-2" />
                전자책 목록으로
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h2>
          <p className="text-gray-600 mb-6">전자책 구매가 성공적으로 완료되었습니다.</p>
          
          {purchaseInfo && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">구매 정보</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">전자책:</span> {purchaseInfo.ebookTitle}</p>
                <p><span className="font-medium">결제 금액:</span> {purchaseInfo.amount.toLocaleString()}원</p>
                <p><span className="font-medium">주문번호:</span> {purchaseInfo.orderId}</p>
                <p><span className="font-medium">구매일시:</span> {new Date(purchaseInfo.purchasedAt).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              지금 다운로드하기
            </button>
            <Link
              href="/ebooks"
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              전자책 목록으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로딩 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}