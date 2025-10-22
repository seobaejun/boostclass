'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MessageCircle, Users, TrendingUp, Clock, ThumbsUp, MessageSquare, User, Search, Filter } from 'lucide-react'

// 시간 포맷 함수
const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const postDate = new Date(dateString)
  const diffInMs = now.getTime() - postDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else {
    return `${diffInDays}일 전`
  }
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [posts, setPosts] = useState<any[]>([])
  const [popularTags, setPopularTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 실제 데이터 가져오기
  useEffect(() => {
    fetchPosts()
    fetchPopularTags()
  }, [])

  // 검색/필터 조건이 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, searchTerm, selectedTag])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      console.log('📚 커뮤니티 게시글 조회 시작...')
      
      // URL 파라미터 구성
      const params = new URLSearchParams()
      if (selectedCategory !== '전체') {
        params.append('category', selectedCategory)
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }
      if (selectedTag.trim()) {
        params.append('tag', selectedTag.trim())
      }
      
      const url = `/api/community${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ 커뮤니티 게시글 조회 성공:', data.posts)
        const formattedPosts = data.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          author: post.author_name,
          category: post.category,
          content: post.content,
          tags: post.tags || [],
          commentCount: post.commentCount || 0,
          likes: post.likes || 0,
          views: post.views || 0,
          timeAgo: formatTimeAgo(post.created_at),
          isHot: (post.likes || 0) > 5 || (post.views || 0) > 50
        }))
        setPosts(formattedPosts)
      } else {
        console.error('❌ 커뮤니티 게시글 조회 실패:', data.error)
        setError('게시글을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 커뮤니티 게시글 조회 중 오류:', error)
      setError('게시글을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPopularTags = async () => {
    try {
      console.log('🏷️ 인기 태그 조회 시작...')
      const response = await fetch('/api/community/popular-tags?limit=10')
      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ 인기 태그 조회 성공:', data.tags)
        setPopularTags(data.tags)
      } else {
        console.error('❌ 인기 태그 조회 실패:', data.error)
      }
    } catch (error) {
      console.error('❌ 인기 태그 조회 중 오류:', error)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      // 로그인 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('로그인이 필요합니다.')
        return
      }

      console.log('👍 좋아요 요청:', postId)
      
      const response = await fetch(`/api/community/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ 좋아요 성공:', data.likes)
        
        // 게시글 목록에서 좋아요 수 업데이트
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, likes: data.likes }
              : post
          )
        )
      } else {
        console.error('❌ 좋아요 실패:', data.error)
        alert(data.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 좋아요 오류:', error)
      alert('좋아요 처리 중 오류가 발생했습니다.')
    }
  }

  // 카테고리 목록 (서버 사이드 검색으로 변경되어 실제 개수는 표시하지 않음)
  const categories = [
    { name: '전체', active: selectedCategory === '전체' },
    { name: '정보공유', active: selectedCategory === '정보공유' },
    { name: '질문답변', active: selectedCategory === '질문답변' },
    { name: '자유게시판', active: selectedCategory === '자유게시판' }
  ]

  // 서버 사이드에서 이미 필터링된 데이터를 사용
  const filteredPosts = posts

  // 페이지네이션 (클라이언트 사이드)
  const postsPerPage = 8
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setSelectedTag('') // 카테고리 변경시 태그 필터 초기화
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    // fetchPosts는 useEffect에서 자동 호출됨
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
    setSelectedCategory('전체') // 태그 선택시 카테고리를 전체로 변경
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTag('')
    setSelectedCategory('전체')
    setCurrentPage(1)
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            커뮤니티
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            함께 성장하는 학습자들의 소통 공간
          </p>
          <p className="text-lg text-blue-100">
            성공 후기, 정보 공유, 질문과 답변을 통해 함께 발전해보세요
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* 검색 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">검색</h3>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="제목, 내용, 작성자 검색..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  검색
                </button>
              </form>
            </div>

            {/* 필터 상태 */}
            {(searchTerm || selectedTag || selectedCategory !== '전체') && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">활성 필터</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    모두 지우기
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory !== '전체' && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                      카테고리: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('전체')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                      검색: {searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedTag && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                      태그: {selectedTag}
                      <button
                        onClick={() => setSelectedTag('')}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 카테고리 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">카테고리</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 인기 태그 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">인기 태그</h3>
              {popularTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tagData, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagClick(tagData.tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTag === tagData.tag
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      #{tagData.tag} ({tagData.count})
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">아직 태그가 없습니다.</div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {searchTerm ? `"${searchTerm}" 검색 결과` :
                     selectedTag ? `#${selectedTag} 태그 게시글` :
                     selectedCategory === '전체' ? '최신 게시글' : `${selectedCategory} 게시글`}
                  </h2>
                  <p className="text-gray-600">
                    총 {filteredPosts.length}개의 게시글이 있습니다
                    {(searchTerm || selectedTag || selectedCategory !== '전체') && (
                      <span className="ml-2 text-blue-600">
                        (필터링됨)
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href="/community/write"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  글쓰기
                </Link>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-gray-500 text-lg mb-4">게시글을 불러오는 중...</div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-red-500 text-lg mb-4">오류가 발생했습니다</div>
                  <p className="text-gray-400 mb-4">{error}</p>
                  <button 
                    onClick={fetchPosts}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : paginatedPosts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="text-gray-500 text-lg mb-4">
                    {posts.length === 0 ? '아직 작성된 게시글이 없습니다' : '검색 결과가 없습니다'}
                  </div>
                  <p className="text-gray-400">
                    {posts.length === 0 ? '첫 번째 게시글을 작성해보세요!' : '다른 검색어나 카테고리를 시도해보세요'}
                  </p>
                </div>
              ) : (
                paginatedPosts.map((post) => (
                <Link key={post.id} href={`/community/${post.id}`}>
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:border-blue-300 border border-transparent transition-all duration-200 cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{post.author}</div>
                          <div className="text-sm text-gray-500">{post.timeAgo}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {post.isHot && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            HOT
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {post.content}
                    </p>

                    {/* 태그 표시 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                          <button
                            key={tagIndex}
                            onClick={(e) => {
                              e.preventDefault()
                              handleTagClick(tag)
                            }}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.commentCount || 0}
                        </div>
                        <button 
                          className="flex items-center hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            handleLike(post.id)
                          }}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {post.likes || 0}
                        </button>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {post.views}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.timeAgo}
                      </div>
                    </div>
                  </div>
                </Link>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  <button 
                    onClick={() => handlePageClick(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-2 text-sm rounded ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    onClick={() => handlePageClick(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
