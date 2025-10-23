'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Download, Eye, Calendar, Star, CheckCircle, FileText, Users, CreditCard } from 'lucide-react'

interface Ebook {
  id: string
  title: string
  description: string
  author: string
  category: string
  price: number
  is_free: boolean
  download_count: number
  file_size: number
  status: string
  created_at: string
  tags: string[]
  cover_image?: string
  thumbnail_url?: string
  detail_image_url?: string
  file_path?: string
}

export default function EbookDetailPage() {
  const params = useParams()
  const ebookId = params.id as string
  const { user } = useAuth()
  
  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [checkingPurchase, setCheckingPurchase] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchEbook()
  }, [ebookId])

  useEffect(() => {
    if (ebook && !ebook.is_free && user) {
      checkPurchaseStatus()
    }
  }, [ebook, user])

  const fetchEbook = async () => {
    try {
      const response = await fetch(`/api/ebooks`)
      const data = await response.json()

      if (data.success && data.ebooks) {
        // ID로 특정 전자책 찾기
        const foundEbook = data.ebooks.find((e: any) => e.id === ebookId)
        if (foundEbook) {
          console.log('📚 전자책 데이터 로드됨:', foundEbook)
          setEbook(foundEbook)
        }
      }
    } catch (error) {
      console.error('Error fetching ebook:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPurchaseStatus = async () => {
    if (!user || !ebook || ebook.is_free) return
    
    setCheckingPurchase(true)
    try {
      // 사용자 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.log('❌ 구매 확인 - 세션 토큰 없음')
        return
      }

      const response = await fetch('/api/ebooks/purchase-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ ebookId })
      })
      
      const data = await response.json()
      if (data.success) {
        setPurchased(data.purchased)
      }
    } catch (error) {
      console.error('구매 상태 확인 실패:', error)
    } finally {
      setCheckingPurchase(false)
    }
  }

  const handlePayment = async () => {
    console.log('🔐 결제 시도 - 사용자 상태:', { user, loading })
    
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!ebook) return

    setProcessing(true)
    try {
      // 사용자 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔐 세션 토큰:', session?.access_token ? '토큰 있음' : '토큰 없음')
      
      if (!session?.access_token) {
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
        return
      }

      // 결제 요청
      const response = await fetch('/api/ebooks/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ ebookId })
      })

      const data = await response.json()
      console.log('💳 결제 API 응답:', data)
      
      if (!data.success) {
        console.error('❌ 결제 요청 실패:', data)
        
        // 강의 결제 코드 참고한 에러 처리
        if (data.tableRequired) {
          alert(`결제 시스템 오류: ${data.error}\n\n관리자가 다음 SQL 스크립트를 실행해야 합니다:\n${data.sqlScript || 'fix-payment-key-constraint.sql'}`)
        } else {
          const errorMsg = data.error || '결제 요청에 실패했습니다.'
          alert(`결제 요청 실패: ${errorMsg}`)
        }
        return
      }

      console.log('✅ 결제 요청 성공:', data)

      // 토스 페이먼츠 SDK 로드 확인
      if (typeof window !== 'undefined' && (window as any).TossPayments) {
        // 토스 페이먼츠 클라이언트 키 (강의 결제와 동일한 키 사용)
        const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_P9BRQmyarYymBN4obxjNrJ07KzLN'
        console.log('🔑 토스 페이먼츠 클라이언트 키:', tossClientKey ? '설정됨' : '없음')
        
        if (!tossClientKey) {
          throw new Error('토스 페이먼츠 클라이언트 키가 설정되지 않았습니다.')
        }
        
        const tossPayments = (window as any).TossPayments(tossClientKey)
        
        console.log('💳 토스 페이먼츠 결제 요청:', data.paymentData)
        
        // 결제 요청
        await tossPayments.requestPayment('카드', {
          amount: data.paymentData.amount,
          orderId: data.paymentData.orderId,
          orderName: data.paymentData.orderName,
          customerName: data.paymentData.customerName,
          customerEmail: data.paymentData.customerEmail,
          successUrl: data.paymentData.successUrl,
          failUrl: data.paymentData.failUrl
        })
      } else {
        alert('결제 시스템을 로드하는 중입니다. 잠시 후 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('결제 처리 오류:', error)
      alert('결제 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      window.location.href = '/auth/login'
      return
    }

    if (!ebook) return

    setDownloading(true)
    try {
      // 사용자 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
        return
      }

      const response = await fetch(`/api/ebooks/download/${ebook.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${ebook.title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        alert('다운로드가 시작됩니다!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || '다운로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error downloading ebook:', error)
      alert('다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      window.location.href = '/auth/login'
      return
    }

    // 유료 전자책 구매 기능 (향후 구현)
    alert('유료 전자책 구매 기능은 준비 중입니다.')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              전자책을 찾을 수 없습니다
            </h1>
            <Link
              href="/ebooks"
              className="text-blue-600 hover:text-blue-500"
            >
              전자책 목록으로 돌아가기
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="h-64 md:h-full bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {ebook.detail_image_url ? (
                  <img
                    src={ebook.detail_image_url}
                    alt={ebook.title}
                    className="w-full h-full object-cover"
                  />
                ) : ebook.thumbnail_url ? (
                  <img
                    src={ebook.thumbnail_url}
                    alt={ebook.title}
                    className="w-full h-full object-cover"
                  />
                ) : ebook.cover_image ? (
                  <img
                    src={ebook.cover_image}
                    alt={ebook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                    📚 {ebook.title}
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-1/2 p-6">
              <div className="mb-4">
                <span className="text-blue-600 text-sm font-medium">
                  {ebook.category || '프로그래밍'}
                </span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                  ebook.is_free 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {ebook.is_free ? '무료' : '유료'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {ebook.title}
              </h1>
              <p className="text-gray-600 mb-6">
                {ebook.description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {ebook.author}
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {formatFileSize(ebook.file_size)}
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {ebook.is_free ? '무료' : formatPrice(ebook.price)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div id="ebook-intro-section" className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">전자책 소개</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {ebook.description}
                </p>
                <p className="text-gray-600">
                  이 전자책은 <strong>{ebook.author}</strong>가 집필한 {ebook.category} 분야의 전문서입니다. 
                  실무에서 바로 활용할 수 있는 노하우와 팁들이 가득 담겨 있어, 
                  해당 분야를 학습하거나 업무에 적용하고자 하는 분들에게 매우 유용할 것입니다.
                </p>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                목차
              </h2>
              <div className="space-y-3">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-4">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      기초 개념과 이론
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {ebook.category} 분야의 기본 개념과 핵심 이론을 다룹니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-4">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      실무 적용 사례
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      실제 업무에서 활용할 수 있는 구체적인 사례와 예제를 제시합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-4">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      고급 기법과 팁
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      전문가만 알고 있는 고급 기법과 실무 노하우를 공유합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-4">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      추가 자료 및 참고문헌
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      더 깊이 있는 학습을 위한 추가 자료와 참고문헌을 제공합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {ebook.is_free ? '무료' : formatPrice(ebook.price)}
                </div>
                <p className="text-gray-500">PDF 다운로드</p>
              </div>

              <div className="space-y-4">
                {user ? (
                  ebook.is_free ? (
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {downloading ? (
                        '다운로드 중...'
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          무료 다운로드
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {checkingPurchase ? (
                        <div className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-lg font-semibold flex items-center justify-center">
                          구매 상태 확인 중...
                        </div>
                      ) : purchased ? (
                        <button
                          onClick={handleDownload}
                          disabled={downloading}
                          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {downloading ? (
                            '다운로드 중...'
                          ) : (
                            <>
                              <Download className="w-5 h-5 mr-2" />
                              다운로드
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handlePayment}
                          disabled={processing}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processing ? (
                            '결제 처리 중...'
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              {formatPrice(ebook.price)} 구매하기
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )
                ) : (
                  <Link
                    href="/auth/login"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    로그인 후 {ebook.is_free ? '다운로드하기' : '구매하기'}
                  </Link>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  전자책 정보
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    저자: {ebook.author}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    파일 크기: {formatFileSize(ebook.file_size)}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    출간일: {formatDate(ebook.created_at)}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    PDF 형식
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    모바일/PC 지원
                  </li>
                </ul>
              </div>

              {/* Tags */}
              {ebook.tags && ebook.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    태그
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ebook.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
