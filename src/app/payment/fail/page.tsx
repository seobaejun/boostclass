'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function PaymentFailPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 실패 메시지 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">결제가 실패했습니다</h1>
          <p className="text-gray-600">결제 처리 중 문제가 발생했습니다.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 실패 안내</h2>
            
            <div className="text-gray-600 mb-6 space-y-2">
              <p>결제 처리 중 오류가 발생했습니다.</p>
              <p>다음과 같은 이유로 결제가 실패할 수 있습니다:</p>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• 카드 정보가 올바르지 않습니다</li>
                <li>• 잔액이 부족합니다</li>
                <li>• 카드 한도를 초과했습니다</li>
                <li>• 네트워크 연결에 문제가 있습니다</li>
                <li>• 결제 시간이 초과되었습니다</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                다시 시도하기
              </button>
              
              <Link
                href="/courses"
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                강의 목록으로 돌아가기
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                문제가 지속되면 고객센터로 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
