'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Users, Clock, Star } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  price: number
  original_price?: number
  duration: number | null
  level: string
  category: {
    name: string
  }
  _count: {
    lessons: number
    purchases: number
  }
}

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
]

export default function FreeCourseSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(4)
  const [freeCourses, setFreeCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  // 무료 강의 데이터 가져오기
  useEffect(() => {
    const fetchFreeCourses = async () => {
      try {
        const response = await fetch('/api/courses?category=무료강의&limit=6')
        const data = await response.json()
        
        console.log('API Response:', data) // 디버깅용
        
        if (data.success && data.data?.courses) {
          setFreeCourses(data.data.courses || [])
        } else {
          console.error('API Error:', data.error || '데이터를 불러올 수 없습니다.')
          // 더미 데이터 제거 - 빈 배열 반환
          setFreeCourses([])
        }
      } catch (error) {
        console.error('Error fetching free courses:', error)
        // 에러 시에도 더미 데이터 제거 - 빈 배열 반환
        setFreeCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchFreeCourses()
  }, [])

  useEffect(() => {
    const updateSlidesToShow = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1)
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2)
      } else if (window.innerWidth < 1280) {
        setSlidesToShow(3)
      } else {
        setSlidesToShow(4)
      }
    }

    updateSlidesToShow()
    window.addEventListener('resize', updateSlidesToShow)
    return () => window.removeEventListener('resize', updateSlidesToShow)
  }, [])

  useEffect(() => {
    // freeCourses가 없거나 slidesToShow보다 적으면 타이머 설정하지 않음
    if (freeCourses.length === 0 || freeCourses.length <= slidesToShow) {
      return
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (freeCourses.length - slidesToShow + 1))
    }, 4000)

    return () => clearInterval(timer)
  }, [freeCourses.length, slidesToShow])

  const nextSlide = () => {
    if (freeCourses.length === 0 || freeCourses.length <= slidesToShow) return
    const maxIndex = Math.max(1, freeCourses.length - slidesToShow + 1)
    setCurrentIndex((prev) => (prev + 1) % maxIndex)
  }

  const prevSlide = () => {
    if (freeCourses.length === 0 || freeCourses.length <= slidesToShow) return
    const maxIndex = Math.max(1, freeCourses.length - slidesToShow + 1)
    setCurrentIndex((prev) => (prev - 1 + maxIndex) % maxIndex)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">무료강의</h2>
            <p className="text-gray-600">전문가들의 노하우를 무료로 만나보세요</p>
          </div>
          <Link href="/courses?category=무료강의" className="text-blue-600 hover:text-blue-700 font-medium">
            더보기 →
          </Link>
        </div>

        {/* Course Slider */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: freeCourses.length > 0 && freeCourses.length > slidesToShow && slidesToShow > 0
                  ? `translateX(-${currentIndex * (100 / Math.max(1, slidesToShow))}%)`
                  : 'translateX(0)',
                width: freeCourses.length > 0 && slidesToShow > 0
                  ? `${Math.max(100, (freeCourses.length / Math.min(slidesToShow, freeCourses.length)) * 100)}%`
                  : '100%'
              }}
            >
              {loading ? (
                // 로딩 스켈레톤
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="px-3"
                    style={{ width: `${100 / 4}%` }}
                  >
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse h-[500px] flex flex-col">
                      <div className="h-48 bg-gray-300"></div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded mb-4"></div>
                          <div className="h-6 bg-gray-300 rounded mb-4"></div>
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        </div>
                        <div className="h-8 bg-gray-300 rounded mt-auto"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                freeCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="px-3"
                    style={{ width: `${100 / freeCourses.length}%` }}
                  >
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 h-[500px] flex flex-col border-2 border-blue-200 group">
                        {/* Course Image - 클릭 가능 */}
                        <Link href={`/courses/${course.id}`} className="block">
                          <div className="aspect-square relative overflow-hidden flex-shrink-0 cursor-pointer">
                          {course.thumbnail_url ? (
                            <Image
                              src={course.thumbnail_url}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div
                              className="w-full h-full relative"
                              style={{ background: gradients[index % gradients.length] }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-4xl">📚</div>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute top-3 left-3">
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              무료강의
                            </span>
                          </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 rounded-full p-3">
                                <Play className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>
                          </div>
                        </Link>

                        {/* Course Info - 다른 카드와 동일한 구조 */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                {course.category?.name || '무료강의'}
                              </span>
                              <div className="flex items-center text-xs text-gray-500">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                <span>4.8</span>
                              </div>
                            </div>

                            {/* 제목과 설명 */}
                            <div className="mb-3">
                              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                {course.title}
                              </h3>
                              
                              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                {course.description}
                              </p>
                            </div>

                            {/* 가격 정보 */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex flex-col w-full">
                                {course.original_price && course.original_price > 0 ? (
                                  <>
                                    <div className="text-sm text-gray-500 line-through">
                                      ₩{course.original_price.toLocaleString()}
                                    </div>
                                    <div className="text-xl font-bold text-blue-600">
                                      무료
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-xl font-bold text-blue-600">
                                    무료
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{course._count?.purchases || 0}명 수강</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration ? `${course.duration}분` : '시간 정보 없음'}</span>
                              </div>
                            </div>
                            
                            {/* 강의 레벨과 수강생 수 */}
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {course.level === 'beginner' ? '초급' : course.level === 'intermediate' ? '중급' : '고급'}
                              </span>
                              <span>{course._count?.lessons || 0}개 강의</span>
                            </div>
                          </div>

                          {/* 무료 수강신청 버튼 - 하단 고정 */}
                          <div className="mt-auto">
                            <Link
                              href={`/courses/${course.id}`}
                              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                            >
                              무료 수강신청
                            </Link>
                          </div>
                        </div>
                      </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:shadow-xl p-2 rounded-full transition-all duration-200 z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:shadow-xl p-2 rounded-full transition-all duration-200 z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Dots Indicator */}
        {freeCourses.length > 0 && freeCourses.length > slidesToShow && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.max(1, freeCourses.length - slidesToShow + 1) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* 데이터가 없을 때 메시지 */}
        {!loading && freeCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 무료강의가 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  )
}
