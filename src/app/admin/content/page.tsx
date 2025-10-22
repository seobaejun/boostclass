'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  FileText,
  MessageSquare,
  Star,
  Award,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Home,
  Calendar,
  User,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  RefreshCw
} from 'lucide-react'

interface Notice {
  id: string
  title: string
  content: string
  author: string
  status: 'published' | 'draft' | 'archived'
  priority: 'high' | 'medium' | 'low'
  views: number
  created_at: string
  updated_at: string
}

interface CommunityPost {
  id: string
  title: string
  content: string
  author: string
  author_email: string
  category: string
  status: 'published' | 'pending' | 'rejected' | 'archived'
  likes: number
  comments: number
  views: number
  created_at: string
  updated_at: string
}

interface Review {
  id: string
  course_id: string
  course_title: string
  user_name: string
  user_email: string
  rating: number
  content: string
  status: 'published' | 'pending' | 'rejected' | 'archived'
  helpful: number
  created_at: string
  updated_at: string
}

interface SuccessStory {
  id: string
  title: string
  content: string
  author: string
  author_email: string
  category: string
  status: 'published' | 'pending' | 'rejected' | 'archived'
  featured: boolean
  views: number
  created_at: string
  updated_at: string
}

type ContentType = 'notices' | 'community' | 'reviews' | 'success-stories'

export default function ContentPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ContentType>('community')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [items, setItems] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)

  const itemsPerPage = 10

  // 페이지네이션 계산 (서버 사이드 페이지네이션)
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedItems = items // 서버에서 이미 페이지네이션된 데이터

  useEffect(() => {
    fetchContent()
  }, [activeTab, currentPage, searchTerm, statusFilter, selectedCategory, selectedStatus])

  // 핸들러 함수들
  const handleItemClick = (item: any) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedItem(null)
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setEditForm({
      title: item.title,
      content: item.content,
      category: item.category,
      status: item.status,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      console.log('콘텐츠 수정 저장:', editForm)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('로그인이 필요합니다.')
        return
      }

      const response = await fetch(`/api/admin/content/${activeTab}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ 콘텐츠 수정 성공')
        alert('콘텐츠가 성공적으로 수정되었습니다.')
        setShowEditModal(false)
        setEditingItem(null)
        setEditForm({})
        // 데이터 새로고침
        fetchContent()
      } else {
        console.error('❌ 콘텐츠 수정 실패:', data.error)
        alert(data.error || '콘텐츠 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 콘텐츠 수정 오류:', error)
      alert('콘텐츠 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteItem = (item: any) => {
    setEditingItem(item)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      console.log('콘텐츠 삭제:', editingItem)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('로그인이 필요합니다.')
        return
      }

      const response = await fetch(`/api/admin/content/${activeTab}/${editingItem.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ 콘텐츠 삭제 성공')
        alert('콘텐츠가 성공적으로 삭제되었습니다.')
        setShowDeleteModal(false)
        setEditingItem(null)
        // 데이터 새로고침
        fetchContent()
      } else {
        console.error('❌ 콘텐츠 삭제 실패:', data.error)
        alert(data.error || '콘텐츠 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 콘텐츠 삭제 오류:', error)
      alert('콘텐츠 삭제 중 오류가 발생했습니다.')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // 검색 시 첫 페이지로 이동
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 이동
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 이동
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'published': '발행됨',
      'draft': '초안',
      'pending': '대기중',
      'rejected': '거부됨',
      'archived': '보관됨'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'published': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-blue-100 text-blue-800',
      'rejected': 'bg-red-100 text-red-800',
      'archived': 'bg-gray-100 text-gray-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityText = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'high': '높음',
      'medium': '보통',
      'low': '낮음'
    }
    return priorityMap[priority] || priority
  }

  const getPriorityColor = (priority: string) => {
    const colorMap: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    }
    return colorMap[priority] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setError('로그인이 필요합니다.')
        setLoading(false)
        return
      }

      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('로그인이 필요합니다.')
        setLoading(false)
        return
      }

      // 실제 API 호출로 콘텐츠 데이터 가져오기
      console.log('🔄 API 호출 시작:', `/api/admin/content/${activeTab}`)
      console.log('🔑 토큰:', session.access_token ? '존재' : '없음')
      
      // URL 파라미터 구성
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      
      // 상태 필터링 - selectedStatus를 우선 사용, 없으면 statusFilter 사용
      const finalStatus = selectedStatus !== 'all' ? selectedStatus : statusFilter
      if (finalStatus !== 'all') params.append('status', finalStatus)
      
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())

      const url = `/api/admin/content/${activeTab}?${params.toString()}`
      console.log('🔍 API URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      console.log('📥 API 응답 상태:', response.status)
      console.log('📥 API 응답 OK:', response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API 오류 응답:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: 콘텐츠 데이터를 가져오는데 실패했습니다.`)
      }

      const data = await response.json()
      console.log('📥 API 응답 데이터:', data)
      
      if (data.success) {
        const allItems = data.items || []
        
        // 서버에서 이미 필터링된 데이터를 사용
        setItems(allItems)
        setTotalItems(data.total || allItems.length)
      } else {
        throw new Error(data.error || '콘텐츠 데이터를 가져오는데 실패했습니다.')
      }

      setLoading(false)

    } catch (err) {
      console.error('콘텐츠 데이터 로드 오류:', err)
      setError('콘텐츠 데이터를 불러오는 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'notices', label: '공지사항', icon: FileText, count: activeTab === 'notices' ? totalItems : 0 },
    { id: 'community', label: '커뮤니티', icon: MessageSquare, count: activeTab === 'community' ? totalItems : 0 },
    { id: 'reviews', label: '리뷰', icon: Star, count: activeTab === 'reviews' ? totalItems : 0 },
    { id: 'success-stories', label: '성공 스토리', icon: Award, count: activeTab === 'success-stories' ? totalItems : 0 }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">콘텐츠 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">콘텐츠 관리</h1>
          <p className="text-gray-600 mt-2">공지사항, 커뮤니티, 리뷰, 성공 스토리를 관리하세요</p>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'notices' && (
            <button
              onClick={() => {
                const newItem = {
                  id: `new-${activeTab}-${Date.now()}`,
                  title: '새 공지사항',
                  content: '새로운 공지사항입니다.',
                  author: '관리자',
                  status: 'draft',
                  priority: 'medium',
                  views: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
                handleEditItem(newItem)
              }}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              새 공지사항 작성
            </button>
          )}
          <button
            onClick={() => {
              setCurrentPage(1)
              setSearchTerm('')
              setStatusFilter('all')
              fetchContent()
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            새로고침
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ContentType)
                setCurrentPage(1)
                setSearchTerm('')
                setStatusFilter('all')
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="제목, 내용, 작성자로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 상태</option>
              <option value="published">발행됨</option>
              <option value="draft">초안</option>
              <option value="pending">대기중</option>
              <option value="rejected">거부됨</option>
              <option value="archived">보관됨</option>
            </select>
          </div>
        </div>
      </div>

      {/* 콘텐츠 목록 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                {activeTab === 'notices' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    우선순위
                  </th>
                )}
                {activeTab === 'community' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                )}
                {activeTab === 'reviews' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평점
                  </th>
                )}
                {activeTab === 'success-stories' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    추천
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">로딩 중...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    콘텐츠가 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.instructor || item.author || '관리자'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    {activeTab === 'notices' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.priority || '보통'}
                      </td>
                    )}
                    {activeTab === 'community' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category || '-'}
                      </td>
                    )}
                    {activeTab === 'reviews' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.rating ? '⭐'.repeat(item.rating) : '-'}
                      </td>
                    )}
                    {activeTab === 'success-stories' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.featured ? '추천' : '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt || item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleItemClick(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, totalItems)}</span> / <span className="font-medium">{totalItems}</span> 개
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  if (pageNumber > totalPages) return null
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* 상세보기 모달 */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">상세 정보</h3>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">내용</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.content}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">작성자</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.author}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">상태</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">생성일</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedItem.createdAt || selectedItem.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">콘텐츠 수정</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">내용</label>
                <textarea
                  value={editForm.content || ''}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {activeTab === 'community' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">카테고리</label>
                  <select
                    value={editForm.category || '정보공유'}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="정보공유">정보공유</option>
                    <option value="질문답변">질문답변</option>
                    <option value="자유게시판">자유게시판</option>
                    <option value="공지사항">공지사항</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">상태</label>
                <select
                  value={editForm.status || 'draft'}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="published">발행됨</option>
                  <option value="draft">초안</option>
                  <option value="pending">대기중</option>
                  <option value="rejected">거부됨</option>
                  <option value="archived">보관됨</option>
                </select>
              </div>
              {activeTab === 'community' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">태그 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={editForm.tags || ''}
                    onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                    placeholder="태그1, 태그2, 태그3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              {activeTab === 'notices' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">우선순위</label>
                  <select
                    value={editForm.priority || 'medium'}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.featured || false}
                  onChange={(e) => setEditForm({...editForm, featured: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">추천 콘텐츠</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 메인페이지 돌아가기 버튼 */}
      <div className="flex justify-center mt-8">
        <Link 
          href="/admin"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Home className="w-5 h-5 mr-2" />
          관리자 메인페이지
        </Link>
      </div>
    </div>
  )
}