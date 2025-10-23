'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function RefundPage() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">환불정책</h1>
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </Link>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">제1조 (환불 원칙)</h2>
            <p className="text-gray-700 leading-relaxed">
              부학당은 전자상거래법 및 소비자기본법에 따라 구매자의 환불 요청을 처리합니다. 
              단, 디지털 콘텐츠의 특성상 일정 기준을 적용합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제2조 (환불 가능 조건)</h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. 강의 환불</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>강의 시작 전:</strong> 100% 환불</li>
                  <li><strong>강의 결제 후:</strong> 환불 불가</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">2. 전자책 환불</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>다운로드 전:</strong> 100% 환불</li>
                  <li><strong>다운로드 후:</strong> 환불 불가</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제3조 (환불 불가 조건)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>다음의 경우에는 환불이 불가능합니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>강의 결제 후 강의를 시작한 경우</li>
                <li>전자책을 다운로드한 경우</li>
                <li>무료 강의 및 무료 전자책</li>
                <li>이벤트나 할인 상품 중 환불 불가 상품</li>
                <li>이용자의 귀책사유로 인한 서비스 이용 장애</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제4조 (특별 환불 정책)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 기술적 오류로 인한 서비스 이용 불가 시: 100% 환불</p>
              <p>2. 강의 내용이 약속과 현저히 다를 경우: 100% 환불</p>
              <p>3. 강사 변경으로 인한 강의 중단 시: 100% 환불</p>
              <p>4. 서비스 종료로 인한 이용 불가 시: 잔여 기간 비례 환불</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제5조 (환불 거부 및 이의제기)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 환불 거부 사유가 있는 경우, 회사는 구체적인 사유를 통지합니다.</p>
              <p>2. 환불 거부에 이의가 있는 경우, 고객센터로 이의제기 가능</p>
              <p>3. 분쟁 발생 시 소비자분쟁조정위원회, 공정거래위원회 등에 조정 신청 가능</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제6조 (기타 사항)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 본 환불정책은 전자상거래법, 소비자기본법 등 관련 법령을 준수합니다.</p>
              <p>2. 정책 변경 시 사전 공지 후 적용됩니다.</p>
              <p>3. 기타 문의사항은 고객센터로 연락 바랍니다.</p>
            </div>
          </section>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">고객센터 안내</h3>
            <div className="text-blue-800 space-y-1">
              <p>이메일: sellinglaboratory2025@gmail.com</p>
              <p>연락처: 010-9068-9982</p>
              <p>운영시간: 평일 09:00 - 18:00</p>
            </div>
          </div>

                 <div className="text-sm text-gray-500 mt-8 pt-6 border-t">
                   <p>부학당 | 대표자: 김해준</p>
                 </div>
        </div>
      </div>
    </div>
  )
}
