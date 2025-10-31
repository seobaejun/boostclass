'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSlider from '@/components/HeroSlider'
import { Play, Star, Users, FileText, Calendar, Gift, Award, TrendingUp, UserPlus, Bell } from 'lucide-react'

// 동적 import로 지연 로딩 (초기 로딩 속도 개선)
const FreeCourseSection = dynamic(() => import('@/components/FreeCourseSection'), {
  loading: () => <div className="py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-64 mb-4"></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="h-96 bg-gray-200 rounded"></div><div className="h-96 bg-gray-200 rounded"></div><div className="h-96 bg-gray-200 rounded"></div><div className="h-96 bg-gray-200 rounded"></div></div></div></div></div>,
  ssr: true
})

const EarlyBirdSection = dynamic(() => import('@/components/EarlyBirdSection'), {
  loading: () => <div className="py-16 bg-orange-50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-64 mb-4"></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><div className="h-80 bg-gray-200 rounded"></div><div className="h-80 bg-gray-200 rounded"></div><div className="h-80 bg-gray-200 rounded"></div></div></div></div></div>,
  ssr: true
})

// 주석 처리된 컴포넌트들은 필요할 때만 동적 로딩
// const ScheduleSection = dynamic(() => import('@/components/ScheduleSection'), { ssr: false })
// const InstructorSection = dynamic(() => import('@/components/InstructorSection'), { ssr: false })

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Slider */}
      <HeroSlider />

      {/* Quick Navigation */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* <Link href="/schedule" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <Play className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">무료강의 일정</span>
            </Link> */}
            <Link href="/courses?tag=얼리버드" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">얼리버드 진행중</span>
            </Link>
            {/* <Link href="/reviews" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">수강 후기</span>
            </Link> */}
            <Link href="/ebooks" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">전자책</span>
            </Link>
            {/* <Link href="/success-stories" className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">수익화 인증</span>
            </Link> */}
            <Link href="/instructor-apply" className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-2">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">강사 지원</span>
            </Link>
            <Link href="/community" className="flex flex-col items-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">커뮤니티</span>
            </Link>
            <Link href="/notices" className="flex flex-col items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mb-2">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">공지사항</span>
            </Link>
            <Link href="/about" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">부스트 클래스</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Free Courses Section */}
      <FreeCourseSection />

      {/* Early Bird Section */}
      <EarlyBirdSection />

      {/* Instructor Section */}
      {/* <InstructorSection /> */}

      {/* Category Banner */}
      <section className="py-16 bg-gray-900 text-white overflow-hidden">
        <div className="relative">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-4xl font-bold mx-8">DESIGN</span>
            <span className="text-4xl font-bold mx-8">E-COMMERCE</span>
            <span className="text-4xl font-bold mx-8">MARKETING</span>
            <span className="text-4xl font-bold mx-8">YOUTUBE</span>
            <span className="text-4xl font-bold mx-8">VIBE CODING</span>
            <span className="text-4xl font-bold mx-8">DESIGN</span>
            <span className="text-4xl font-bold mx-8">E-COMMERCE</span>
            <span className="text-4xl font-bold mx-8">MARKETING</span>
            <span className="text-4xl font-bold mx-8">YOUTUBE</span>
            <span className="text-4xl font-bold mx-8">VIBE CODING</span>
            <span className="text-4xl font-bold mx-8">DESIGN</span>
            <span className="text-4xl font-bold mx-8">E-COMMERCE</span>
            <span className="text-4xl font-bold mx-8">MARKETING</span>
            <span className="text-4xl font-bold mx-8">YOUTUBE</span>
            <span className="text-4xl font-bold mx-8">VIBE CODING</span>
          </div>
        </div>
      </section>

      {/* Schedule Calendar Section */}
      {/* <ScheduleSection /> */}

      <Footer />
    </div>
  )
}
