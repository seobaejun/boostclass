import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 매출 데이터 API 호출됨')
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ 인증 토큰이 없습니다.')
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('🔑 토큰 추출 완료')
    
    // Supabase에서 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      console.error('❌ 사용자 인증 실패:', userError?.message)
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }
    
    console.log('✅ 사용자 인증 성공:', user.email)

    // 구매 데이터 조회 (purchases 테이블이 없을 수 있으므로 빈 배열로 초기화)
    let purchases: any[] = []
    
    try {
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          id,
          amount,
          status,
          created_at,
          courses (
            id,
            title,
            category,
            instructor
          )
        `)
        .eq('status', 'completed')

      if (purchasesError) {
        console.log('⚠️ purchases 테이블이 없거나 오류 발생:', purchasesError.message)
        // purchases 테이블이 없을 경우 빈 배열로 처리
        purchases = []
      } else {
        purchases = purchasesData || []
      }
    } catch (error) {
      console.log('⚠️ purchases 테이블 조회 실패, 빈 데이터로 처리:', error)
      purchases = []
    }

    console.log('📈 구매 데이터 조회 완료:', purchases?.length || 0, '건')

    // 매출 통계 계산
    const totalRevenue = purchases?.reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0
    const totalTransactions = purchases?.length || 0
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // 월별 매출 계산
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const monthlyRevenue = purchases?.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at)
      return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear
    }).reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0

    // 주간 매출 계산 (최근 7일)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weeklyRevenue = purchases?.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at)
      return purchaseDate >= weekAgo
    }).reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0

    // 일일 매출 계산 (오늘)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dailyRevenue = purchases?.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at)
      return purchaseDate >= today && purchaseDate < tomorrow
    }).reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0

    // 카테고리별 매출 계산
    const categoryRevenue: { [key: string]: number } = {}
    purchases?.forEach(purchase => {
      const category = purchase.courses?.category || '기타'
      categoryRevenue[category] = (categoryRevenue[category] || 0) + (purchase.amount || 0)
    })

    const revenueByCategory = Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
    }))

    // 월별 매출 데이터 (최근 3개월)
    const monthlyData: { [key: string]: { revenue: number, transactions: number } } = {}
    purchases?.forEach(purchase => {
      const purchaseDate = new Date(purchase.created_at)
      const monthKey = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, transactions: 0 }
      }
      
      monthlyData[monthKey].revenue += purchase.amount || 0
      monthlyData[monthKey].transactions += 1
    })

    const revenueByMonth = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-3)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        transactions: data.transactions
      }))

    // 인기 강의 TOP 3
    const courseRevenue: { [key: string]: { title: string, revenue: number, sales: number, instructor: string } } = {}
    purchases?.forEach(purchase => {
      const courseId = purchase.courses?.id
      const courseTitle = purchase.courses?.title || '알 수 없음'
      const instructor = purchase.courses?.instructor || '알 수 없음'
      
      if (courseId) {
        if (!courseRevenue[courseId]) {
          courseRevenue[courseId] = { title: courseTitle, revenue: 0, sales: 0, instructor }
        }
        
        courseRevenue[courseId].revenue += purchase.amount || 0
        courseRevenue[courseId].sales += 1
      }
    })

    const topCourses = Object.values(courseRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
      .map((course, index) => ({
        id: `course-${index + 1}`,
        title: course.title,
        revenue: course.revenue,
        sales: course.sales,
        instructor: course.instructor
      }))

    // 최근 거래 내역 (최근 10건)
    const recentTransactions = purchases
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((purchase, index) => ({
        id: `tx-${index + 1}`,
        date: purchase.created_at,
        amount: purchase.amount || 0,
        course: purchase.courses?.title || '알 수 없음',
        user: `user${index + 1}@example.com`, // 실제로는 사용자 정보를 가져와야 함
        status: purchase.status as 'completed' | 'pending' | 'refunded'
      })) || []

    // 환불률 계산 (환불된 거래가 있다면)
    const refundedCount = purchases?.filter(p => p.status === 'refunded').length || 0
    const refundRate = totalTransactions > 0 ? (refundedCount / totalTransactions) * 100 : 0

    const revenueStats = {
      overview: {
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        dailyRevenue,
        totalTransactions,
        averageOrderValue,
        refundRate
      },
      revenueByCategory,
      revenueByMonth,
      topCourses,
      recentTransactions
    }

    console.log('✅ 매출 통계 계산 완료')

    return NextResponse.json({
      success: true,
      data: revenueStats
    })

  } catch (error) {
    console.error('❌ 매출 데이터 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '매출 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
