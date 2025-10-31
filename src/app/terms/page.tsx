'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function TermsPage() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">이용약관</h1>
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </Link>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 부스트클래스(이하 "회사")가 제공하는 온라인 강의 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제2조 (정의)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. "서비스"란 회사가 제공하는 온라인 강의, 전자책, 커뮤니티 등의 모든 서비스를 의미합니다.</p>
              <p>2. "이용자"란 서비스에 접속하여 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 의미합니다.</p>
              <p>3. "회원"이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</p>
              <p>2. 회사는 필요하다고 인정되는 경우 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.</p>
              <p>3. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제4조 (서비스의 제공)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>온라인 강의 서비스</li>
                <li>전자책 서비스</li>
                <li>커뮤니티 서비스</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
              <p>2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제5조 (이용자의 의무)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 이용자는 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>신청 또는 변경시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제6조 (회사의 의무)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.</p>
              <p>2. 회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함)보호를 위한 보안 시스템을 구축하여야 합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제7조 (서비스 이용료)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 서비스 이용료는 각 강의별로 정해진 금액을 기준으로 합니다.</p>
              <p>2. 결제는 토스페이먼츠를 통해 이루어지며, 결제 완료 시 즉시 서비스 이용이 가능합니다.</p>
              <p>3. 환불은 환불정책에 따라 처리됩니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제8조 (면책조항)</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
              <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제9조 (준거법 및 관할법원)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 대한민국 법률에 따라 규율되고 해석되며, 회사와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.
            </p>
          </section>

                 <div className="text-sm text-gray-500 mt-8 pt-6 border-t">
                   <p>부스트클래스 | 대표자: 서배준</p>
                 </div>
        </div>
      </div>
    </div>
  )
}
