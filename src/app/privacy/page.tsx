'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function PrivacyPage() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">개인정보처리방침</h1>
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </Link>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">제1조 (개인정보의 처리목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              부스트클래스(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">1. 회원 가입 및 관리</p>
              <p className="text-gray-700">2. 서비스 제공 및 계약 이행</p>
              <p className="text-gray-700">3. 결제 및 환불 처리</p>
              <p className="text-gray-700">4. 고객 상담 및 문의 응답</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              <p>2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>회원 정보: 회원 탈퇴 시까지</li>
                <li>결제 정보: 5년 (전자상거래법)</li>
                <li>고객 상담 기록: 3년</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제3조 (처리하는 개인정보의 항목)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">필수항목:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>이름, 이메일, 비밀번호</li>
                  <li>연락처 (휴대폰 번호)</li>
                  <li>결제 정보 (카드번호, 계좌번호 등)</li>
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">선택항목:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>프로필 사진</li>
                  <li>관심 분야</li>
                  <li>추가 연락처</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제4조 (개인정보의 제3자 제공)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
              <p>2. 회사는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>토스페이먼츠: 결제 처리</li>
                <li>Supabase: 데이터 저장 및 관리</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제5조 (개인정보처리의 위탁)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>토스페이먼츠: 결제 처리</li>
                <li>Supabase: 클라우드 서비스 제공</li>
              </ul>
              <p>2. 회사는 위탁계약 체결 시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>개인정보 처리현황 통지요구</li>
                <li>개인정보 열람요구</li>
                <li>개인정보 정정·삭제요구</li>
                <li>개인정보 처리정지요구</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제7조 (개인정보의 안전성 확보조치)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 개인정보의 암호화, 보안프로그램 설치</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제8조 (개인정보보호책임자)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다:</p>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p><strong>개인정보보호책임자:</strong> 서배준</p>
                <p><strong>연락처:</strong> 010-3673-6942</p>
                <p><strong>이메일:</strong> sprince1004@naver.com</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제9조 (권익침해 구제방법)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>정보주체는 아래의 기관에 대해 개인정보 침해신고를 할 수 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>개인정보보호위원회 (privacy.go.kr / 국번없이 182)</li>
                <li>개인정보보호신고센터 (privacy.go.kr / 국번없이 182)</li>
                <li>대검찰청 사이버범죄수사단 (www.spo.go.kr / 02-3480-3571)</li>
                <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
              </ul>
            </div>
          </section>

                 <div className="text-sm text-gray-500 mt-8 pt-6 border-t">
                   <p>부스트클래스 | 대표자: 서배준</p>
                 </div>
        </div>
      </div>
    </div>
  )
}
