'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  Download,
  Upload,
  FileText,
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
  RefreshCw,
  BookOpen,
  File,
  Clock,
  BarChart3,
  TrendingUp
} from 'lucide-react'

interface Ebook {
  id: string
  title: string
  description: string
  author: string
  category: string
  file_size: number
  file_type: string
  download_count: number
  price: number
  is_free: boolean
  status: 'published' | 'draft' | 'archived'
  featured: boolean
  created_at: string
  updated_at: string
  cover_image?: string
  thumbnail_url?: string
  detail_image_url?: string
  tags: string[]
}

export default function EbookManagementPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null)
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null)
  const [editForm, setEditForm] = useState<Partial<Ebook>>({})
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    author: '',
    category: '프로그래밍',
    price: 0,
    is_free: true,
    status: 'draft',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [selectedDetailImage, setSelectedDetailImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    fetchEbooks()
  }, [currentPage, searchTerm, categoryFilter, statusFilter])

  // 핸들러 함수들
  const handleEbookClick = (ebook: Ebook) => {
    setSelectedEbook(ebook)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedEbook(null)
  }

  const handleEditEbook = (ebook: Ebook) => {
    setEditingEbook(ebook)
    setEditForm({
      title: ebook.title,
      description: ebook.description,
      author: ebook.author,
      category: ebook.category,
      price: ebook.price,
      is_free: ebook.is_free,
      status: ebook.status,
      featured: ebook.featured,
      tags: ebook.tags
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingEbook) return
    
    try {
      const response = await fetch(`/api/admin/ebooks/${editingEbook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })
      
      if (!response.ok) {
        throw new Error('전자책 수정에 실패했습니다.')
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log('전자책 수정 성공:', data)
        
        setShowEditModal(false)
        setEditingEbook(null)
        setEditForm({})
        fetchEbooks()
      } else {
        setError(data.error || '전자책 수정 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('전자책 수정 오류:', error)
      setError('전자책 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteEbook = (ebook: Ebook) => {
    setEditingEbook(ebook)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!editingEbook) return
    
    try {
      const response = await fetch(`/api/admin/ebooks/${editingEbook.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error('전자책 삭제에 실패했습니다.')
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log('전자책 삭제 성공:', data)
        
        setShowDeleteModal(false)
        setEditingEbook(null)
        fetchEbooks()
      } else {
        setError(data.error || '전자책 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('전자책 삭제 오류:', error)
      setError('전자책 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleUploadEbook = async () => {
    // 필수 필드 검증
    if (!uploadForm.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!uploadForm.description.trim()) {
      setError('설명을 입력해주세요.')
      return
    }
    if (!uploadForm.author.trim()) {
      setError('저자를 입력해주세요.')
      return
    }
    if (!selectedFile) {
      setError('PDF 파일을 선택해주세요.')
      return
    }
    
    try {
      setUploading(true)
      setError(null)
      
      // FormData 생성
      const formData = new FormData()
      formData.append('title', uploadForm.title)
      formData.append('description', uploadForm.description)
      formData.append('author', uploadForm.author)
      formData.append('category', uploadForm.category)
      formData.append('price', uploadForm.price.toString())
      formData.append('is_free', uploadForm.is_free.toString())
      formData.append('status', uploadForm.status)
      formData.append('tags', JSON.stringify(uploadForm.tags))
      formData.append('file', selectedFile)
      
      // 이미지 파일들 추가
      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail)
      }
      if (selectedDetailImage) {
        formData.append('detailImage', selectedDetailImage)
      }
      
      const response = await fetch('/api/admin/ebooks/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('업로드 응답 상태:', response.status, response.statusText)
      console.log('응답 헤더:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        // 응답 텍스트 먼저 확인
        const responseText = await response.text()
        console.error('업로드 실패 응답 텍스트:', responseText)
        
        let errorData: { error?: string } = {}
        try {
          errorData = JSON.parse(responseText) as { error?: string }
        } catch (e) {
          console.error('JSON 파싱 실패:', e)
          errorData = { error: responseText || '알 수 없는 오류가 발생했습니다.' }
        }
        
        console.error('업로드 실패 응답:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: 전자책 업로드에 실패했습니다.`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log('전자책 업로드 성공:', data)
        
        setShowUploadModal(false)
      setUploadForm({
        title: '',
        description: '',
        author: '',
        category: '프로그래밍',
        price: 0,
        is_free: true,
        status: 'draft',
        tags: []
      })
        setNewTag('')
        setSelectedFile(null)
        setSelectedThumbnail(null)
        setSelectedDetailImage(null)
        fetchEbooks()
      } else {
        // 테이블이 없는 경우 특별 처리
        if (data.tableRequired) {
          setError('ebooks 테이블이 존재하지 않습니다. Supabase에서 create-ebooks-table.sql 스크립트를 실행해주세요.')
        } else {
          setError(data.error || '전자책 업로드 중 오류가 발생했습니다.')
        }
      }
    } catch (error) {
      console.error('전자책 업로드 오류:', error)
      setError('전자책 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !uploadForm.tags.includes(newTag.trim())) {
      setUploadForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setUploadForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // PDF 파일 검증
      if (file.type !== 'application/pdf') {
        setError('PDF 파일만 업로드 가능합니다.')
        return
      }
      
      // 파일 크기 검증 (50MB)
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        setError('파일 크기는 50MB를 초과할 수 없습니다.')
        return
      }
      
      setSelectedFile(file)
      setError(null)
      console.log('선택된 파일:', { name: file.name, size: file.size, type: file.type })
    }
  }

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.')
        return
      }
      
      // 파일 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('이미지 파일 크기는 5MB를 초과할 수 없습니다.')
        return
      }
      
      setSelectedThumbnail(file)
      setError(null)
    }
  }

  const handleDetailImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.')
        return
      }
      
      // 파일 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('이미지 파일 크기는 5MB를 초과할 수 없습니다.')
        return
      }
      
      setSelectedDetailImage(file)
      setError(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'published': '발행됨',
      'draft': '초안',
      'archived': '보관됨'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'published': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-gray-100 text-gray-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const fetchEbooks = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setError('로그인이 필요합니다.')
        setLoading(false)
        return
      }

      // 실제 API 호출로 전자책 데이터 가져오기
      const response = await fetch('/api/admin/ebooks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('전자책 데이터를 가져오는데 실패했습니다.')
      }

      const data = await response.json()
      
      // 테이블이 없는 경우 메시지 표시
      if (data.message && data.message.includes('테이블이 존재하지 않습니다')) {
        setError('ebooks 테이블이 존재하지 않습니다. Supabase에서 테이블을 먼저 생성해주세요.')
        setLoading(false)
        return
      }
      
      const allEbooks = data.ebooks || []

      // 필터링 적용
      let filteredEbooks = allEbooks

      if (searchTerm) {
        filteredEbooks = filteredEbooks.filter((ebook: Ebook) =>
          ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ebook.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (categoryFilter !== 'all') {
        filteredEbooks = filteredEbooks.filter((ebook: Ebook) => ebook.category === categoryFilter)
      }

      if (statusFilter !== 'all') {
        filteredEbooks = filteredEbooks.filter((ebook: Ebook) => ebook.status === statusFilter)
      }

      setEbooks(filteredEbooks)
    } catch (error) {
      console.error('전자책 데이터 로드 오류:', error)
      setError('전자책 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['프로그래밍', '디자인', '마케팅', '비즈니스', '기타']
  const totalEbooks = ebooks.length
  const totalDownloads = ebooks.reduce((sum, ebook) => sum + ebook.download_count, 0)
  const totalRevenue = ebooks.reduce((sum, ebook) => sum + (ebook.price * ebook.download_count), 0)
  const freeEbooks = ebooks.filter(ebook => ebook.is_free).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">전자책 데이터를 불러오는 중...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">전자책 관리</h1>
          <p className="text-gray-600 mt-2">전자책 업로드, 관리, 다운로드 통계를 확인하세요</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            전자책 업로드
          </button>
          <button
            onClick={() => {
              setCurrentPage(1)
              setSearchTerm('')
              setCategoryFilter('all')
              setStatusFilter('all')
              fetchEbooks()
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            새로고침
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/test-supabase-storage')
                const data = await response.json()
                console.log('Supabase Storage 테스트 결과:', data)
                if (data.success) {
                  alert('✅ Supabase Storage 연결 성공!\n' + JSON.stringify(data.data, null, 2))
                } else {
                  alert('❌ Supabase Storage 연결 실패:\n' + data.error + '\n단계: ' + data.step)
                }
              } catch (error) {
                console.error('테스트 오류:', error)
                alert('테스트 중 오류 발생: ' + error)
              }
            }}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            🧪 Storage 테스트
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 전자책</p>
              <p className="text-2xl font-bold text-gray-900">{totalEbooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 다운로드</p>
              <p className="text-2xl font-bold text-gray-900">{totalDownloads.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 매출</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">무료 전자책</p>
              <p className="text-2xl font-bold text-gray-900">{freeEbooks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="제목, 저자, 설명으로 검색..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="published">발행</option>
              <option value="draft">초안</option>
              <option value="archived">보관됨</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setStatusFilter('all')
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 전자책 목록 */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  전자책 정보
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  저자
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  다운로드
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  파일 크기
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ebooks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">등록된 전자책이 없습니다</p>
                      <p className="text-gray-400 text-sm mb-4">새로운 전자책을 업로드해보세요</p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        전자책 업로드
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                ebooks.map((ebook) => (
                <tr key={ebook.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{ebook.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{ebook.description}</div>
                        {ebook.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            추천
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ebook.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ebook.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ebook.status)}`}>
                      {getStatusText(ebook.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ebook.is_free ? (
                      <span className="text-green-600 font-medium">무료</span>
                    ) : (
                      formatCurrency(ebook.price)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ebook.download_count.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(ebook.file_size)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(ebook.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEbookClick(ebook)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="상세보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {ebook.status === 'published' && (
                        <a
                          href={`/api/ebooks/download/${ebook.id}`}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="다운로드"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEditEbook(ebook)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEbook(ebook)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="삭제"
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

      {/* 상세보기 모달 */}
      {showDetailModal && selectedEbook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">전자책 상세 정보</h3>
                <button
                  onClick={handleCloseDetailModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>제목:</strong> {selectedEbook.title}</p>
                    <p><strong>저자:</strong> {selectedEbook.author}</p>
                    <p><strong>카테고리:</strong> {selectedEbook.category}</p>
                    <p><strong>상태:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedEbook.status)}`}>
                      {getStatusText(selectedEbook.status)}
                    </span></p>
                  </div>
                  <div>
                    <p><strong>다운로드 수:</strong> {selectedEbook.download_count.toLocaleString()}</p>
                    <p><strong>가격:</strong> {selectedEbook.is_free ? '무료' : formatCurrency(selectedEbook.price)}</p>
                    <p><strong>파일 크기:</strong> {formatFileSize(selectedEbook.file_size)}</p>
                    <p><strong>파일 형식:</strong> {selectedEbook.file_type}</p>
                  </div>
                </div>
                <div>
                  <p><strong>설명:</strong></p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-800">{selectedEbook.description}</p>
                  </div>
                </div>
                {selectedEbook.tags.length > 0 && (
                  <div>
                    <p><strong>태그:</strong></p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedEbook.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>등록일:</strong> {formatDate(selectedEbook.created_at)}</p>
                  <p><strong>수정일:</strong> {formatDate(selectedEbook.updated_at)}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && editingEbook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">전자책 수정</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">저자</label>
                    <input
                      type="text"
                      value={editForm.author || ''}
                      onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <select
                      value={editForm.category || '프로그래밍'}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                    <select
                      value={editForm.status || 'draft'}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">초안</option>
                      <option value="published">발행</option>
                      <option value="archived">보관됨</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">가격</label>
                    <input
                      type="number"
                      value={editForm.price || 0}
                      onChange={(e) => setEditForm({...editForm, price: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_free"
                      checked={editForm.is_free || false}
                      onChange={(e) => setEditForm({...editForm, is_free: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_free" className="ml-2 block text-sm text-gray-900">
                      무료 전자책
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={editForm.featured || false}
                      onChange={(e) => setEditForm({...editForm, featured: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      추천 전자책
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">전자책 업로드</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">저자</label>
                    <input
                      type="text"
                      value={uploadForm.author}
                      onChange={(e) => setUploadForm({...uploadForm, author: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                    <select
                      value={uploadForm.status}
                      onChange={(e) => setUploadForm({...uploadForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">초안</option>
                      <option value="published">발행</option>
                      <option value="archived">보관됨</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">가격</label>
                    <input
                      type="number"
                      value={uploadForm.price}
                      onChange={(e) => setUploadForm({...uploadForm, price: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="upload_is_free"
                        checked={uploadForm.is_free}
                        onChange={(e) => setUploadForm({...uploadForm, is_free: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="upload_is_free" className="ml-2 block text-sm text-gray-900">
                        무료 전자책
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder="태그를 입력하고 Enter"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                    >
                      추가
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 -mr-0.5 h-4 w-4 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">파일 업로드</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      {selectedFile ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600">✅ 파일 선택됨</p>
                          <p className="text-sm text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            파일 제거
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600">PDF 파일을 클릭하여 업로드</p>
                          <p className="text-xs text-gray-500 mt-1">최대 50MB, PDF 형식만 지원</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* 썸네일 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">썸네일 이미지 (선택사항)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailSelect}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      {selectedThumbnail ? (
                        <div className="space-y-2">
                          <img
                            src={URL.createObjectURL(selectedThumbnail)}
                            alt="썸네일 미리보기"
                            className="w-24 h-24 object-cover mx-auto rounded-lg"
                          />
                          <p className="text-sm font-medium text-green-600">✅ 썸네일 선택됨</p>
                          <p className="text-xs text-gray-500">{selectedThumbnail.name}</p>
                          <button
                            type="button"
                            onClick={() => setSelectedThumbnail(null)}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            이미지 제거
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">썸네일 이미지 업로드</p>
                          <p className="text-xs text-gray-500 mt-1">최대 5MB, JPG/PNG 형식</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* 상세 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상세 이미지 (선택사항)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDetailImageSelect}
                      className="hidden"
                      id="detail-image-upload"
                    />
                    <label htmlFor="detail-image-upload" className="cursor-pointer">
                      {selectedDetailImage ? (
                        <div className="space-y-2">
                          <img
                            src={URL.createObjectURL(selectedDetailImage)}
                            alt="상세 이미지 미리보기"
                            className="w-32 h-20 object-cover mx-auto rounded-lg"
                          />
                          <p className="text-sm font-medium text-green-600">✅ 상세 이미지 선택됨</p>
                          <p className="text-xs text-gray-500">{selectedDetailImage.name}</p>
                          <button
                            type="button"
                            onClick={() => setSelectedDetailImage(null)}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            이미지 제거
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">상세 페이지 이미지 업로드</p>
                          <p className="text-xs text-gray-500 mt-1">최대 5MB, JPG/PNG 형식</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleUploadEbook}
                  disabled={uploading || !selectedFile}
                  className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md flex items-center ${
                    uploading || !selectedFile 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      업로드
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && editingEbook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">전자책 삭제</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">정말로 삭제하시겠습니까?</p>
                    <p className="text-sm text-gray-600">
                      <strong>{editingEbook.title}</strong> 전자책이 영구적으로 삭제됩니다.
                    </p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    ⚠️ 이 작업은 되돌릴 수 없습니다. 전자책과 관련된 모든 데이터가 삭제됩니다.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
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
