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

type ContentItem = Notice | CommunityPost | Review | SuccessStory

// 타입 가드 함수들
function isReview(item: ContentItem): item is Review {
  return 'rating' in item
}

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
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [editForm, setEditForm] = useState<Record<string, unknown>>({})
  const [createForm, setCreateForm] = useState<Record<string, unknown>>({
    title: '',
    content: '',
    priority: 'medium',
    status: 'published'
  })
  const [items, setItems] = useState<ContentItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [tabCounts, setTabCounts] = useState({
    notices: 0,
    community: 0,
    reviews: 0,
    'success-stories': 0
  })

  const itemsPerPage = 10

  // 페이지네이션 계산 (서버 사이드 페이지네이션)
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedItems = items // 서버에서 이미 페이지네이션된 데이터
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  useEffect(() => {
    fetchContent()
    fetchAllTabCounts() // 모든 탭의 개수 가져오기
  }, [activeTab, currentPage, searchTerm, statusFilter, selectedCategory, selectedStatus])

  // 모달이 열릴 때 첫 번째 입력 필드에 포커스
  useEffect(() => {
    if (showCreateModal) {
      // 약간의 지연을 두어 모달이 완전히 렌더링된 후 포커스
      const timer = setTimeout(() => {
        const titleInput = document.querySelector('input[tabindex="1"]') as HTMLInputElement
        if (titleInput) {
          titleInput.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showCreateModal])

  // 핸들러 함수들
  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedItem(null)
  }

  const handleEditItem = (item: ContentItem) => {
    setEditingItem(item)
    setEditForm({
      ...('title' in item ? { title: item.title } : 'course_title' in item ? { course_title: item.course_title } : {}),
      content: item.content,
      ...('category' in item ? { category: item.category } : {}),
      status: item.status,
      ...('tags' in item && Array.isArray(item.tags) ? { tags: item.tags.join(', ') } : ('tags' in item ? { tags: item.tags || '' } : {}))
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      if (!editingItem) return
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
        fetchAllTabCounts() // 탭 개수 새로고침
      } else {
        console.error('❌ 콘텐츠 수정 실패:', data.error)
        alert(data.error || '콘텐츠 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 콘텐츠 수정 오류:', error)
      alert('콘텐츠 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteItem = (item: ContentItem) => {
    setEditingItem(item)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      if (!editingItem) return
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
        fetchAllTabCounts() // 탭 개수 새로고침
      } else {
        console.error('❌ 콘텐츠 삭제 실패:', data.error)
        alert(data.error || '콘텐츠 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 콘텐츠 삭제 오류:', error)
      alert('콘텐츠 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleCreateContent = () => {
    setCreateForm({
      title: '',
      content: '',
      priority: 'normal',
      status: 'published'
    })
    setShowCreateModal(true)
  }

  // 테스트 API 호출 함수
  const testAPI = async () => {
    console.log('🧪 테스트 API 호출 시작...')
    
    try {
      const response = await fetch('/api/test-notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          title: '테스트 제목',
          content: '테스트 내용'
        })
      })
      
      console.log('🧪 테스트 응답 상태:', response.status)
      const data = await response.json()
      console.log('🧪 테스트 응답 데이터:', data)
      
      alert(`테스트 API 결과:\n상태: ${response.status}\n메시지: ${data.message}`)
    } catch (error) {
      console.error('🧪 테스트 API 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      alert(`테스트 API 오류: ${errorMessage}`)
    }
  }

  const handleSaveCreate = async () => {
    try {
      console.log('새 콘텐츠 작성:', createForm)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('로그인이 필요합니다.')
        return
      }

    console.log('📤 API 요청 시작:', `/api/admin/content/${activeTab}`)
    console.log('📤 요청 데이터:', createForm)
    
    const response = await fetch(`/api/admin/content/${activeTab}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(createForm)
    })

    console.log('📥 응답 상태:', response.status, response.statusText)
    console.log('📥 응답 헤더:', Object.fromEntries(response.headers.entries()))
    console.log('📥 응답 URL:', response.url)
    console.log('📥 응답 타입:', response.type)
    console.log('📥 응답 리다이렉트됨:', response.redirected)

    let data
    try {
      data = await response.json()
      console.log('📥 응답 JSON 파싱 성공:', data)
    } catch (jsonError) {
      console.error('❌ JSON 파싱 실패:', jsonError)
      let responseText = ''
      try {
        responseText = await response.text()
      } catch (textError) {
        const errorMessage = textError instanceof Error ? textError.message : '알 수 없는 오류'
        responseText = '텍스트 읽기 실패: ' + errorMessage
      }
      console.error('❌ 응답 텍스트:', responseText)
      console.error('❌ 응답 상태 재확인:', response.status, response.statusText)
      const jsonErrorMessage = jsonError instanceof Error ? jsonError.message : '알 수 없는 오류'
      alert(`API 응답 파싱 실패: ${jsonErrorMessage}\n응답 상태: ${response.status}\n응답 텍스트: ${responseText}`)
      return
    }

    if (response.ok && data.success) {
        console.log('✅ 콘텐츠 작성 성공')
        alert('콘텐츠가 성공적으로 작성되었습니다.')
        setShowCreateModal(false)
        setCreateForm({
          title: '',
          content: '',
          priority: 'normal',
          status: 'published'
        })
        fetchContent() // 데이터 새로고침
        fetchAllTabCounts() // 탭 개수 새로고침
      } else {
        console.error('❌ 콘텐츠 작성 실패:', data.error)
        console.log('📋 전체 API 응답:', data)
        console.log('🔍 tableCreationRequired:', data.tableCreationRequired)
        
        if (data.tableCreationRequired) {
          // 더 자세한 테이블 생성 안내
          const sqlScript = data.sqlScript || `-- notices 테이블 생성
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' NOT NULL CHECK (priority IN ('normal', 'important')),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_id UUID,
  status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('published', 'draft', 'archived')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- RLS 비활성화 (테스트용)
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;`
          
          console.log('📋 SQL 스크립트:', sqlScript)
          
          alert(`❌ notices 테이블이 존재하지 않습니다!

🔧 해결 방법:

1️⃣ Supabase 대시보드 접속
   - https://supabase.com/dashboard
   - 프로젝트 선택

2️⃣ SQL Editor 열기
   - 왼쪽 메뉴에서 "SQL Editor" 클릭

3️⃣ 다음 SQL 코드 실행:
   - 새 쿼리 생성
   - 아래 SQL 코드 복사/붙여넣기
   - "Run" 버튼 클릭

4️⃣ 다시 공지사항 작성 시도

💡 SQL 코드가 콘솔에 출력되었습니다. F12를 눌러 개발자 도구에서 확인하세요.`)
        } else {
          alert(`❌ 공지사항 작성 실패\n\n오류: ${data.error || '알 수 없는 오류가 발생했습니다.'}\n\n다시 시도해주세요.`)
        }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 작성 오류:', error)
      alert('콘텐츠 작성 중 오류가 발생했습니다.')
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

  // 모든 탭의 개수를 가져오는 함수
  const fetchAllTabCounts = async () => {
    try {
      if (!user) return

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const tabTypes: ContentType[] = ['notices', 'community', 'reviews', 'success-stories']
      const counts = { ...tabCounts }

      // 각 탭의 개수를 병렬로 가져오기
      await Promise.all(
        tabTypes.map(async (tabType) => {
          try {
            const response = await fetch(`/api/admin/content/${tabType}?limit=1&page=1&status=all`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
            })

            if (response.ok) {
              const data = await response.json()
              if (data.success) {
                counts[tabType] = data.total || 0
              }
            }
          } catch (error) {
            console.warn(`탭 ${tabType} 개수 조회 실패:`, error)
            counts[tabType] = 0
          }
        })
      )

      setTabCounts(counts)
    } catch (error) {
      console.warn('탭 개수 조회 중 오류:', error)
    }
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
    { id: 'notices', label: '공지사항', icon: FileText, count: tabCounts.notices },
    { id: 'community', label: '커뮤니티', icon: MessageSquare, count: tabCounts.community },
    { id: 'reviews', label: '리뷰', icon: Star, count: tabCounts.reviews },
    { id: 'success-stories', label: '성공 스토리', icon: Award, count: tabCounts['success-stories'] }
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
            <>
              <button
                onClick={handleCreateContent}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                새 공지사항 작성
              </button>
              
              <button
                onClick={testAPI}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                🧪 API 테스트
              </button>
            </>
          )}
          <button
            onClick={() => {
              setCurrentPage(1)
              setSearchTerm('')
              setStatusFilter('all')
              fetchContent()
              fetchAllTabCounts() // 탭 개수 새로고침
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
                      <div className="text-sm font-medium text-gray-900">
                        {(() => {
                          if ('title' in item) return item.title;
                          if ('course_title' in item) return item.course_title;
                          return (item as ContentItem).id;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        if ('instructor' in item) return String(item.instructor);
                        if ('author' in item) return String(item.author);
                        if ('user_name' in item) return String(item.user_name);
                        return '관리자';
                      })() as string}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    {activeTab === 'notices' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {('priority' in item) && (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (item as Notice).priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : (item as Notice).priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {(item as Notice).priority === 'high' ? '높음' : (item as Notice).priority === 'medium' ? '보통' : '낮음'}
                          </span>
                        )}
                      </td>
                    )}
                    {activeTab === 'community' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {'category' in item ? (item.category || '-') : '-'}
                      </td>
                    )}
                    {activeTab === 'reviews' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isReview(item) ? ('⭐'.repeat(item.rating)) : '-'}
                      </td>
                    )}
                    {activeTab === 'success-stories' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {('featured' in item && item.featured) ? '추천' : '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {('views' in item && item.views) || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        const dateValue = 
                          ('createdAt' in item && item.createdAt) ? String(item.createdAt) :
                          ('created_at' in item && item.created_at) ? String(item.created_at) :
                          new Date().toISOString();
                        return new Date(dateValue).toLocaleDateString();
                      })()}
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
                <p className="mt-1 text-sm text-gray-900">
                  {(() => {
                    if (!selectedItem) return '';
                    if ('title' in selectedItem) return selectedItem.title;
                    if ('course_title' in selectedItem) return selectedItem.course_title;
                    return (selectedItem as ContentItem).id;
                  })()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">내용</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.content}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">작성자</label>
                <p className="mt-1 text-sm text-gray-900">
                  {(() => {
                    if ('author' in selectedItem) return (selectedItem as Notice | CommunityPost | SuccessStory).author;
                    if ('user_name' in selectedItem) return (selectedItem as Review).user_name;
                    return '관리자';
                  })()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">상태</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">생성일</label>
                <p className="mt-1 text-sm text-gray-900">
                  {(() => {
                    const dateValue = 
                      ('createdAt' in selectedItem && selectedItem.createdAt) ? String(selectedItem.createdAt) :
                      ('created_at' in selectedItem && selectedItem.created_at) ? String(selectedItem.created_at) :
                      new Date().toISOString();
                    return new Date(dateValue).toLocaleDateString();
                  })()}
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
                  value={('title' in editForm && editForm.title) ? String(editForm.title) : ('course_title' in editForm && editForm.course_title) ? String(editForm.course_title) : ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">내용</label>
                <textarea
                  value={(editForm.content as string) || ''}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {activeTab === 'community' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">카테고리</label>
                  <select
                    value={('category' in editForm && editForm.category) ? String(editForm.category) : '정보공유'}
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
                  value={(editForm.status as string) || 'draft'}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as 'published' | 'pending' | 'archived' | 'rejected'})}
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
                    value={('tags' in editForm && editForm.tags) ? String(editForm.tags) : ''}
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
                    value={(editForm.priority as string) || 'normal'}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">일반공지</option>
                    <option value="important">중요공지</option>
                  </select>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={(editForm.featured as boolean) || false}
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

      {/* 콘텐츠 작성 모달 */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            // 배경 클릭 시 모달 닫기
            if (e.target === e.currentTarget) {
              setShowCreateModal(false)
            }
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  새 {activeTab === 'notices' ? '공지사항' : '콘텐츠'} 작성
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    value={(createForm.title as string) || ''}
                    onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="제목을 입력하세요"
                    autoFocus
                    tabIndex={1}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                  <textarea
                    value={(createForm.content as string) || ''}
                    onChange={(e) => setCreateForm({...createForm, content: e.target.value})}
                    rows={8}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-vertical"
                    placeholder="내용을 입력하세요"
                    tabIndex={2}
                  />
                </div>
                
                {activeTab === 'notices' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                    <select
                      value={(createForm.priority as string) || 'medium'}
                      onChange={(e) => setCreateForm({...createForm, priority: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      tabIndex={3}
                    >
                      <option value="normal">일반공지</option>
                      <option value="important">중요공지</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select
                    value={(createForm.status as string) || 'published'}
                    onChange={(e) => setCreateForm({...createForm, status: e.target.value as 'published' | 'pending' | 'archived' | 'rejected'})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    tabIndex={4}
                  >
                    <option value="published">발행됨</option>
                    <option value="draft">초안</option>
                    <option value="archived">보관됨</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    tabIndex={6}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCreate}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    tabIndex={5}
                  >
                    작성 완료
                  </button>
                </div>
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