'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Clock, 
  MessageCircle, 
  ThumbsUp, 
  Users, 
  Share2, 
  Flag,
  Edit,
  Trash2
} from 'lucide-react'

interface Post {
  id: string
  title: string
  author_name: string
  author_email: string
  category: string
  content: string
  tags: string[]
  status: string
  views: number
  likes: number
  created_at: string
  updated_at: string
}

interface Comment {
  id: string
  content: string
  author_name: string
  author_email: string
  author_id: string
  likes: number
  created_at: string
  updated_at: string
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/community/${params.id}`)
        
        if (!response.ok) {
          throw new Error('게시글을 찾을 수 없습니다')
        }
        
        const data = await response.json()
        if (data.success && data.post) {
          setPost(data.post)
          setLikes(data.post.likes || 0)
          setLiked((data.post.likes || 0) > 0) // 좋아요 수가 0보다 크면 liked 상태
        } else {
          throw new Error('게시글을 찾을 수 없습니다')
        }
      } catch (error) {
        console.error('게시글 조회 오류:', error)
        setError(error instanceof Error ? error.message : '게시글을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    const fetchComments = async () => {
      try {
        setCommentsLoading(true)
        const response = await fetch(`/api/community/${params.id}/comments`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setComments(data.comments || [])
          }
        }
      } catch (error) {
        console.error('댓글 조회 오류:', error)
      } finally {
        setCommentsLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
      fetchComments()
    }
  }, [params.id])

  const handleLike = async () => {
    try {
      // 로그인 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('로그인이 필요합니다.')
        return
      }

      console.log('👍 상세페이지 좋아요 요청:', params.id)
      
      const response = await fetch(`/api/community/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ 상세페이지 좋아요 성공:', data.likes)
        
        // 좋아요 수와 상태 업데이트
        setLikes(data.likes)
        setLiked(data.likes > 0)
      } else {
        console.error('❌ 상세페이지 좋아요 실패:', data.error)
        alert(data.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 상세페이지 좋아요 오류:', error)
      alert('좋아요 처리 중 오류가 발생했습니다.')
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    try {
      setSubmittingComment(true)

      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('로그인이 필요합니다.')
        return
      }

      const response = await fetch(`/api/community/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        // 댓글 목록에 새 댓글 추가
        setComments(prev => [...prev, data.comment])
        setNewComment('')
        alert('댓글이 작성되었습니다!')
      } else {
        alert(data.error || '댓글 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error)
      alert('댓글 작성에 실패했습니다.')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.content.substring(0, 100) + '...',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
    
    return date.toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">게시글을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-8">{error || '요청하신 게시글이 존재하지 않습니다.'}</p>
          <Link
            href="/community"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            커뮤니티로 돌아가기
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{post.author_name}</div>
                  <div className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {post.category}
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* Post Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {likes}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {post.views}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center px-3 py-1 rounded-lg transition-colors ${
                    liked 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                  좋아요
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  공유
                </button>
              </div>
            </div>
          </div>

          {/* Post Body */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  댓글 {comments.length}개
                </h3>
              </div>

              {/* Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 작성해주세요..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={3}
                        disabled={submittingComment}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={submittingComment || !newComment.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingComment ? '작성 중...' : '댓글 작성'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    로그인하기
                  </Link>
                </div>
              )}

              {/* Comments List */}
              {commentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">댓글을 불러오는 중...</p>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author_name}</span>
                          <span className="text-sm text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-700 mb-2 whitespace-pre-line">{comment.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button className="flex items-center hover:text-gray-700">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {comment.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>아직 댓글이 없습니다.</p>
                  <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
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