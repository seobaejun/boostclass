import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-blue-400 mb-4">부스트클래스</h3>
            <p className="text-gray-300 text-sm mb-2">
              회사명 : 부스트웹 ｜ 대표자 : 서배준 ｜ 연락처 : 010-3673-6942
            </p>
            <p className="text-gray-300 text-sm mb-2">
              사업자등록번호 : 152-74-00452 ｜ 통신판매신고번호 : 제2024-충남천안-2840호
            </p>
            <p className="text-gray-300 text-sm mb-2">
              주소 : 충청남도 천안시 서북구 월봉로 126, 901-17호(쌍용동, 대림프라자)
            </p>
            <p className="text-gray-300 text-sm">
              개인정보보호 최고 책임자 : 서배준 ｜ 담당자 메일 : sprince1004@naver.com
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">빠른 링크</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-blue-400">
                  회사소개
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-300 hover:text-blue-400">
                  클래스
                </Link>
              </li>
              <li>
                <Link href="/ebooks" className="text-gray-300 hover:text-blue-400">
                  전자책
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-blue-400">
                  커뮤니티
                </Link>
              </li>
              <li>
                <Link href="/notices" className="text-gray-300 hover:text-blue-400">
                  공지사항
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">고객 지원</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-blue-400">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-blue-400">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-300 hover:text-blue-400">
                  환불정책
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 부스트클래스. 모든 권리 보유.
            </p>
        </div>
      </div>
    </footer>
  )
}
