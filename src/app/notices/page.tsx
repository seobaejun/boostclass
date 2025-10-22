'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, Eye, Pin, Search, Filter } from 'lucide-react'

interface Notice {
  id: string
  title: string
  content: string
  priority: 'normal' | 'important'
  author_name: string
  author_email: string
  status: 'published' | 'draft' | 'archived'
  views: number
  created_at: string
  updated_at: string
}

// 더미 데이터 제거하고 실제 API에서 데이터 가져오기

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // 공지사항 데이터 가져오기
  useEffect(() => {
    fetchNotices()
  }, [])

  // 검색어나 카테고리 변경 시 데이터 다시 가져오기
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNotices()
    }, 300) // 300ms 디바운스

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 검색 파라미터 구성
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('priority', selectedCategory)
      params.append('page', '1')
      params.append('limit', '50') // 충분한 수의 공지사항을 가져옴
      
      const response = await fetch(`/api/notices?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // API에서 이미 발행된 공지사항만 반환하므로 추가 필터링 불필요
        setNotices(data.items || [])
      } else {
        // 테이블이 없는 경우 특별 처리
        if (data.tableNotFound) {
          setError('공지사항 시스템이 아직 설정되지 않았습니다.')
        } else {
          setError(data.error || '공지사항을 불러오는데 실패했습니다.')
        }
      }
    } catch (error: any) {
      console.error('공지사항 조회 오류:', error)
      setError('공지사항을 불러오는데 실패했습니다.')
      setNotices([]) // 오류 시 빈 배열로 설정
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'important':
        return 'bg-red-100 text-red-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'important':
        return '중요공지'
      case 'normal':
        return '일반공지'
      default:
        return '공지'
    }
  }

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 카테고리 필터링은 우선순위 기반으로 변경
    const matchesCategory = !selectedCategory || 
                           (selectedCategory === 'important' && notice.priority === 'important') ||
                           (selectedCategory === 'normal' && notice.priority === 'normal')
    
    return matchesSearch && matchesCategory
  })

  const pinnedNotices = filteredNotices.filter(notice => notice.priority === 'important')
  const regularNotices = filteredNotices.filter(notice => notice.priority === 'normal')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            공지사항
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            잘파는클래스의 최신 소식과 중요한 안내사항을 확인하세요
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="제목이나 내용으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">모든 우선순위</option>
              <option value="important">중요공지</option>
              <option value="normal">일반공지</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </section>

      {/* Notices List */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">공지사항을 불러오는 중...</p>
            </div>
          )}

          {/* 오류 상태 */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 font-medium">오류가 발생했습니다</p>
                <p className="text-red-500 text-sm mt-2">{error}</p>
                <button
                  onClick={fetchNotices}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* 데이터 없음 상태 */}
          {!loading && !error && notices.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-gray-600 font-medium">등록된 공지사항이 없습니다</p>
                <p className="text-gray-500 text-sm mt-2">새로운 공지사항이 등록되면 여기에 표시됩니다.</p>
              </div>
            </div>
          )}

          {/* 공지사항 목록 */}
          {!loading && !error && notices.length > 0 && (
            <>
              {/* Pinned Notices */}
              {pinnedNotices.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Pin className="w-5 h-5 mr-2 text-red-500" />
                중요 공지
              </h2>
              <div className="space-y-4">
                {pinnedNotices.map((notice) => (
                  <div key={notice.id} className="bg-red-50 border-l-4 border-red-500 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(notice.priority)}`}>
                            {getPriorityLabel(notice.priority)}
                          </span>
                          <Pin className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="w-4 h-4 mr-1" />
                          {notice.views.toLocaleString()}
                        </div>
                      </div>
                      
                      <Link href={`/notices/${notice.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors">
                          {notice.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 mb-4">
                        {notice.content}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(notice.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Notices */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              일반 공지
            </h2>
            <div className="space-y-4">
              {regularNotices.map((notice) => (
                <div key={notice.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(notice.priority)}`}>
                        {getPriorityLabel(notice.priority)}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="w-4 h-4 mr-1" />
                        {notice.views.toLocaleString()}
                      </div>
                    </div>
                    
                    <Link href={`/notices/${notice.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors">
                        {notice.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-4">
                      {notice.content}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(notice.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </>
          )}

          {/* Pagination - 실제 데이터가 있을 때만 표시 */}
          {!loading && !error && notices.length > 0 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex space-x-2">
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                이전
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-2 text-sm rounded ${
                    page === 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                다음
              </button>
            </nav>
          </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            문의사항이 있으신가요?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            고객센터를 통해 언제든지 문의해 주세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              문의하기
            </Link>
            <Link
              href="/faq"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              자주 묻는 질문
            </Link>
          </div>
          <div className="mt-8 text-blue-100">
            <p>고객센터 운영시간: 주중 10:00~18:00</p>
            <p>이메일: titanclass@titanz.co.kr | 전화: 070-4138-2146</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
