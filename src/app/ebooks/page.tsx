'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Download, Star, Eye, Calendar, Search, Filter } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

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
}

export default function EbooksPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPrice, setSelectedPrice] = useState('')
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 전자책 데이터 가져오기
  useEffect(() => {
    fetchEbooks()
  }, [])

  const fetchEbooks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/ebooks')
      
      if (!response.ok) {
        throw new Error('전자책 데이터를 가져오는데 실패했습니다.')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // published 상태인 전자책만 표시
        const publishedEbooks = data.ebooks.filter((ebook: Ebook) => ebook.status === 'published')
        setEbooks(publishedEbooks)
      } else {
        throw new Error(data.error || '전자책 데이터를 가져오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('전자책 데이터 가져오기 실패:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEbooks = ebooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || ebook.category === selectedCategory
    const matchesPrice = !selectedPrice || 
      (selectedPrice === 'free' && ebook.is_free) ||
      (selectedPrice === 'paid' && !ebook.is_free)
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  const formatPrice = (ebook: Ebook) => {
    if (ebook.is_free) return '무료'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(ebook.price)
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
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/ /g, '')
  }

  const handleDownloadOrPurchase = async (ebook: Ebook) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setLoading(prev => ({ ...prev, [ebook.id]: true }))

    try {
      const action = ebook.is_free ? 'download' : 'purchase'
      
      if (action === 'download') {
        // 무료 전자책 다운로드
        const response = await fetch(`/api/ebooks/download/${ebook.id}`)
        
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
      } else {
        // 유료 전자책 구매 (향후 구현)
        alert('유료 전자책 구매 기능은 준비 중입니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(prev => ({ ...prev, [ebook.id]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            전자책
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            전문가들의 노하우가 담긴 실무 중심 전자책을 만나보세요
          </p>
          <p className="text-lg text-blue-100">
            무료부터 프리미엄까지, 다양한 주제의 전자책이 준비되어 있습니다
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="제목, 저자, 내용으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">모든 카테고리</option>
              <option value="블로그">블로그</option>
              <option value="AI">AI</option>
              <option value="유튜브">유튜브</option>
              <option value="재테크">재테크</option>
              <option value="마케팅">마케팅</option>
              <option value="디자인">디자인</option>
            </select>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">모든 가격</option>
              <option value="free">무료</option>
              <option value="paid">유료</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setSelectedPrice('')
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </section>


      {/* Ebooks Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">전자책을 불러오는 중...</span>
            </div>
          )}

          {/* 오류 상태 */}
          {error && (
            <div className="text-center py-16">
              <div className="text-red-600 mb-4">⚠️ {error}</div>
              <button
                onClick={fetchEbooks}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 전자책이 없는 경우 */}
          {!isLoading && !error && filteredEbooks.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-500 mb-4">📚 표시할 전자책이 없습니다.</div>
              <p className="text-gray-400">
                {ebooks.length === 0 
                  ? '아직 등록된 전자책이 없습니다.' 
                  : '검색 조건에 맞는 전자책이 없습니다. 필터를 조정해보세요.'
                }
              </p>
            </div>
          )}

          {/* 전자책 목록 */}
          {!isLoading && !error && filteredEbooks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEbooks.map((ebook) => (
                <div key={ebook.id} className="group block">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col border-2 border-gray-200">
                    {/* Ebook Cover */}
                    <div className="aspect-square relative overflow-hidden flex-shrink-0">
                      {ebook.thumbnail_url ? (
                        <img
                          src={ebook.thumbnail_url}
                          alt={ebook.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : ebook.cover_image ? (
                        <img
                          src={ebook.cover_image}
                          alt={ebook.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600">
                        </div>
                      )}
                      
                      {/* Free/Paid Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ebook.is_free 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {ebook.is_free ? '무료' : '유료'}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          📚 전자책
                        </span>
                      </div>

                      {/* Hover Download Button */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-3">
                          <Download className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Ebook Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                          {ebook.category || '프로그래밍'}
                        </span>
                      </div>

                      {/* 제목과 설명 - 고정 높이 영역 */}
                      <div className="flex-1 mb-3">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors h-8">
                          {ebook.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed h-6">
                          {ebook.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {ebook.author}
                          </div>
                        </div>
                      </div>

                      {/* Price - 고정 높이로 카드 크기 통일 */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col h-8 justify-end">
                            {!ebook.is_free ? (
                              <>
                                <div className="h-5"></div>
                                <div className="text-xl font-bold text-orange-600">
                                  {formatPrice(ebook)}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-5"></div>
                                <div className="text-xl font-bold text-green-600">
                                  무료
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/ebooks/${ebook.id}`}
                          className="px-4 py-2 rounded-lg text-sm transition-colors bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          더알아보기
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            더 많은 전자책이 궁금하신가요?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            매주 새로운 전문가의 노하우가 담긴 전자책이 업데이트됩니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              온라인 강의 보기
            </Link>
            <Link
              href="/auth/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              회원가입하기
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
