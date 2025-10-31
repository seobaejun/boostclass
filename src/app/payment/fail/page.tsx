'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, Home, ArrowLeft } from 'lucide-react'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '결제가 취소되었습니다.'
  const code = searchParams.get('code')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          
          {code && (
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-red-700">
                <span className="font-medium">오류 코드:</span> {code}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              다시 시도하기
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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로딩 중...</h2>
          </div>
        </div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  )
}