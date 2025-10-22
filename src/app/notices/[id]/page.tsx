'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react'

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

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchNotice(params.id as string)
    }
  }, [params.id])

  const fetchNotice = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/notices/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (data.success) {
        setNotice(data.notice)
      } else {
        setError(data.error || '공지사항을 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('공지사항 상세 조회 오류:', error)
      setError(error.message || '공지사항을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">공지사항을 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium">오류가 발생했습니다</p>
              <p className="text-red-500 text-sm mt-2">{error}</p>
              <div className="mt-4 space-x-3">
                <button
                  onClick={() => fetchNotice(params.id as string)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  다시 시도
                </button>
                <Link
                  href="/notices"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-block"
                >
                  목록으로
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-gray-600">공지사항을 찾을 수 없습니다.</p>
            <Link
              href="/notices"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              목록으로 돌아가기
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link
            href="/notices"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            공지사항 목록으로
          </Link>
        </div>

        {/* 공지사항 내용 */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(notice.priority)}`}>
                {getPriorityLabel(notice.priority)}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {notice.views.toLocaleString()}
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {notice.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {notice.author_name}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(notice.created_at)}
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="px-6 py-8">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {notice.content}
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {notice.updated_at !== notice.created_at && (
                  <span>마지막 수정: {formatDate(notice.updated_at)}</span>
                )}
              </div>
              <Link
                href="/notices"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                목록으로
              </Link>
            </div>
          </div>
        </article>
      </div>

      <Footer />
    </div>
  )
}
