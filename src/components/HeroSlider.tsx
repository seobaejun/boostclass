'use client'

import Link from 'next/link'

const slide = {
  id: 1,
  title: 'AI 자동화 바이브 코딩 무료특강',
  subtitle: '서배준 강사의 올인원 무료강의',
  description: '홈페이지 제작과 프로그램 제작을 한번에!!',
  image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  badge: '무료강의',
  instructor: '서배준',
  link: '/courses?category=무료강의'
}

export default function HeroSlider() {
  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div className="relative w-full h-full" style={{ background: slide.image }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl text-white">
              <div className="flex items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  slide.badge === '무료강의' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-orange-500 text-white'
                }`}>
                  {slide.badge}
                </span>
                <span className="ml-3 text-sm opacity-90">강사: {slide.instructor}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                AI 자동화 바이브 코딩 <span className="animate-blink-color">무료특강</span>
              </h1>
              <h2 className="text-lg md:text-xl mb-6 opacity-90 leading-normal">
                {slide.subtitle}
              </h2>
              <p className="text-base md:text-lg mb-8 opacity-80 leading-normal">
                {slide.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={slide.link}
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                >
                  무료 신청하기
                </Link>
                <Link
                  href="/courses"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors text-center"
                >
                  모든 강의 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
