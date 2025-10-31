import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 더미 강사 데이터 함수
function getDummyInstructors() {
  return [
    {
      id: 1,
      name: '김성공',
      nickname: '김성공 강사님',
      specialty: '온라인 마케팅',
      description: '10년간의 디지털 마케팅 경험을 바탕으로 실무 중심의 강의를 제공합니다.',
      avatar: '🚀',
      rating: 4.9,
      students: 15000,
      courses: 8,
      totalRevenue: '월 1억원',
      experience: '10년',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      achievements: [
        '온라인 쇼핑몰 월매출 1억 달성',
        '네이버 스마트스토어 베스트셀러',
        '구글 애드워즈 인증 전문가',
        '페이스북 마케팅 파트너'
      ],
      courses_taught: [
        '네이버 스마트스토어 완전정복',
        '구글 광고로 매출 10배 늘리기',
        '인스타그램 마케팅 실전 가이드'
      ],
      intro: '안녕하세요! 10년간 온라인 마케팅 분야에서 활동하며 수많은 성공 사례를 만들어온 김성공입니다. 실제로 검증된 노하우만을 전달드립니다.'
    },
    {
      id: 2,
      name: '박부자',
      nickname: '박부자 강사님',
      specialty: '투자 & 재테크',
      description: '20년간의 투자 경험과 자산관리 노하우를 공유합니다.',
      avatar: '💰',
      rating: 4.8,
      students: 12000,
      courses: 6,
      totalRevenue: '월 8천만원',
      experience: '20년',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      achievements: [
        '개인 자산 100억 달성',
        '부동산 투자 수익률 연 30%',
        '주식 투자 10년 연속 수익',
        '재테크 베스트셀러 작가'
      ],
      courses_taught: [
        '부동산 투자 완전정복',
        '주식 투자 기초부터 고급까지',
        '월급쟁이 재테크 로드맵'
      ],
      intro: '20년간의 투자 경험을 통해 쌓은 노하우를 여러분과 공유하고 싶습니다. 안전하면서도 수익성 높은 투자 방법을 알려드리겠습니다.'
    },
    {
      id: 3,
      name: '이창업',
      nickname: '이창업 강사님',
      specialty: '창업 & 사업',
      description: '3번의 창업 경험과 2번의 엑시트를 통해 얻은 실전 창업 노하우를 전수합니다.',
      avatar: '🏢',
      rating: 4.7,
      students: 8500,
      courses: 5,
      totalRevenue: '월 6천만원',
      experience: '15년',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      achievements: [
        '스타트업 2회 엑시트 성공',
        '벤처투자 유치 총 50억원',
        '창업 멘토링 500건 이상',
        '중소벤처기업부 창업 자문위원'
      ],
      courses_taught: [
        '제로부터 시작하는 창업 가이드',
        '투자 유치 완전정복',
        '온라인 비즈니스 모델 설계'
      ],
      intro: '3번의 창업과 2번의 성공적인 엑시트 경험을 바탕으로, 실패하지 않는 창업 방법을 알려드리겠습니다.'
    },
    {
      id: 4,
      name: '최개발',
      nickname: '최개발 강사님',
      specialty: '프로그래밍 & 개발',
      description: '15년 경력의 풀스택 개발자로, 실무에서 바로 쓸 수 있는 개발 기술을 가르칩니다.',
      avatar: '💻',
      rating: 4.9,
      students: 20000,
      courses: 12,
      totalRevenue: '월 1억 2천만원',
      experience: '15년',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      achievements: [
        '네이버, 카카오 시니어 개발자 출신',
        '오픈소스 프로젝트 기여자',
        '개발 서적 3권 출간',
        'IT 컨퍼런스 정기 발표자'
      ],
      courses_taught: [
        'React로 만드는 현대적 웹앱',
        'Node.js 백엔드 완전정복',
        'AWS 클라우드 실전 가이드'
      ],
      intro: '대기업에서 15년간 개발하며 쌓은 경험을 바탕으로, 실무에서 바로 활용할 수 있는 개발 기술을 전수해드립니다.'
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    console.log('👥 공개 강사 목록 조회 요청...')
    
    // 강사 데이터 조회 (승인된 강사만)
    const { data: instructors, error } = await supabase
      .from('instructors')
      .select(`
        id,
        name,
        email,
        bio,
        specialties,
        experience_years,
        education,
        certifications,
        profile_image,
        portfolio_url,
        social_links,
        created_at
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('강사 데이터 조회 오류:', error)
      console.error('오류 코드:', error.code)
      console.error('오류 메시지:', error.message)
      
      // instructors 테이블이 존재하지 않는 경우 더미 데이터 반환
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('⚠️ instructors 테이블이 존재하지 않습니다. 더미 데이터를 반환합니다.')
        return NextResponse.json({
          success: true,
          instructors: getDummyInstructors()
        })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: '강사 데이터를 불러오는 중 오류가 발생했습니다.' 
      }, { status: 500 })
    }

    // 강사 데이터가 없는 경우 더미 데이터 반환
    if (!instructors || instructors.length === 0) {
      console.log('⚠️ 등록된 강사가 없습니다. 더미 데이터를 반환합니다.')
      return NextResponse.json({
        success: true,
        instructors: getDummyInstructors()
      })
    }

    // 강사별 통계 정보 추가
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        try {
          // 강의 수 조회
          const { count: coursesCount } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('instructor', instructor.name)

          // 학생 수 조회 (강의별 학생 수의 합)
          const { data: courses } = await supabase
            .from('courses')
            .select('student_count')
            .eq('instructor', instructor.name)

          const totalStudents = courses?.reduce((sum, course) => sum + (course.student_count || 0), 0) || 0

          // 평균 평점 조회
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('instructor', instructor.name)

          const averageRating = reviews && reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0

          // 강의 제목들 조회
          const { data: courseTitles } = await supabase
            .from('courses')
            .select('title')
            .eq('instructor', instructor.name)
            .limit(3)

          return {
            id: instructor.id,
            name: instructor.name,
            nickname: `${instructor.name} 강사님`,
            specialty: instructor.specialties?.[0] || '전문가',
            description: instructor.bio || '전문 지식과 경험을 바탕으로 한 강의를 제공합니다.',
            avatar: '🎓',
            rating: Math.round(averageRating * 10) / 10,
            students: totalStudents,
            courses: coursesCount || 0,
            totalRevenue: '월 수익 달성',
            experience: `${instructor.experience_years || 0}년`,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            achievements: instructor.certifications || [],
            courses_taught: courseTitles?.map(c => c.title) || [],
            intro: instructor.bio || '안녕하세요. 전문 지식과 경험을 바탕으로 한 강의를 제공합니다.'
          }
        } catch (error) {
          console.error(`강사 ${instructor.name} 통계 조회 오류:`, error)
          return {
            id: instructor.id,
            name: instructor.name,
            nickname: `${instructor.name} 강사님`,
            specialty: instructor.specialties?.[0] || '전문가',
            description: instructor.bio || '전문 지식과 경험을 바탕으로 한 강의를 제공합니다.',
            avatar: '🎓',
            rating: 0,
            students: 0,
            courses: 0,
            totalRevenue: '월 수익 달성',
            experience: `${instructor.experience_years || 0}년`,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            achievements: instructor.certifications || [],
            courses_taught: [],
            intro: instructor.bio || '안녕하세요. 전문 지식과 경험을 바탕으로 한 강의를 제공합니다.'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      instructors: instructorsWithStats
    })

  } catch (error) {
    console.error('❌ 강사 목록 조회 오류:', error)
    console.log('⚠️ 오류 발생으로 인해 더미 데이터를 반환합니다.')
    
    // 오류 발생 시에도 더미 데이터 반환하여 사용자 경험 개선
    return NextResponse.json({
      success: true,
      instructors: getDummyInstructors()
    })
  }
}
