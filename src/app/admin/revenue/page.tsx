'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Calendar,
  CreditCard,
  Home,
  BarChart,
  PieChart,
  LineChart,
  Download
} from 'lucide-react'

interface RevenueStats {
  overview: {
    totalRevenue: number
    monthlyRevenue: number
    weeklyRevenue: number
    dailyRevenue: number
    totalTransactions: number
    averageOrderValue: number
    refundRate: number
  }
  revenueByCategory: Array<{
    category: string
    revenue: number
    percentage: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    transactions: number
  }>
  topCourses: Array<{
    id: string
    title: string
    revenue: number
    sales: number
    instructor: string
  }>
  recentTransactions: Array<{
    id: string
    date: string
    amount: number
    course: string
    user: string
    status: 'completed' | 'pending' | 'refunded'
  }>
}

export default function RevenuePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<RevenueStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.email) {
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

        // 실제 API 호출로 매출 데이터 가져오기
        const response = await fetch('/api/admin/revenue', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: 매출 데이터를 가져오는데 실패했습니다.`)
        }

        const data = await response.json()
        
        if (data.success) {
          setStats(data.data)
        } else {
          throw new Error(data.error || '매출 데이터를 가져오는데 실패했습니다.')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('매출 통계 로드 오류:', error)
        setError('매출 통계를 불러오는 중 오류가 발생했습니다.')
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.email])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'refunded': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '완료'
      case 'pending': return '대기'
      case 'refunded': return '환불'
      default: return '알 수 없음'
    }
  }

  const downloadExcelReport = () => {
    if (!stats) return

    // 워크북 생성
    const workbook = XLSX.utils.book_new()

    // 1. 매출 개요 시트
    const overviewData = [
      ['매출 개요', ''],
      ['총 매출', formatCurrency(stats.overview.totalRevenue)],
      ['이번 달 매출', formatCurrency(stats.overview.monthlyRevenue)],
      ['이번 주 매출', formatCurrency(stats.overview.weeklyRevenue)],
      ['일일 매출', formatCurrency(stats.overview.dailyRevenue)],
      ['총 거래 수', stats.overview.totalTransactions],
      ['평균 주문 금액', formatCurrency(stats.overview.averageOrderValue)],
      ['환불률', `${stats.overview.refundRate}%`]
    ]
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
    XLSX.utils.book_append_sheet(workbook, overviewSheet, '매출 개요')

    // 2. 카테고리별 매출 시트
    const categoryData = [
      ['카테고리', '매출', '비율(%)']
    ]
    stats.revenueByCategory.forEach(category => {
      categoryData.push([
        category.category,
        category.revenue.toString(),
        category.percentage.toFixed(1)
      ])
    })
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
    XLSX.utils.book_append_sheet(workbook, categorySheet, '카테고리별 매출')

    // 3. 월별 매출 시트
    const monthlyData = [
      ['월', '매출', '거래 수']
    ]
    stats.revenueByMonth.forEach(month => {
      monthlyData.push([
        month.month,
        month.revenue.toString(),
        month.transactions.toString()
      ])
    })
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData)
    XLSX.utils.book_append_sheet(workbook, monthlySheet, '월별 매출')

    // 4. 인기 강의 시트
    const topCoursesData = [
      ['순위', '강의명', '강사', '판매량', '매출']
    ]
    stats.topCourses.forEach((course, index) => {
      topCoursesData.push([
        (index + 1).toString(),
        course.title,
        course.instructor,
        course.sales.toString(),
        course.revenue.toString()
      ])
    })
    const topCoursesSheet = XLSX.utils.aoa_to_sheet(topCoursesData)
    XLSX.utils.book_append_sheet(workbook, topCoursesSheet, '인기 강의')

    // 5. 거래 내역 시트
    const transactionsData = [
      ['거래 ID', '날짜', '강의', '구매자', '금액', '상태']
    ]
    stats.recentTransactions.forEach(transaction => {
      transactionsData.push([
        transaction.id.toString(),
        formatDate(transaction.date),
        transaction.course,
        transaction.user,
        transaction.amount.toString(),
        getStatusLabel(transaction.status)
      ])
    })
    const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData)
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, '거래 내역')

    // 파일 다운로드
    const fileName = `매출보고서_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">매출 통계를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">매출 데이터 없음</h3>
          <p className="text-gray-600">아직 매출 데이터가 없습니다. 강의를 판매하면 여기에 표시됩니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">매출 관리</h1>
          <p className="text-gray-600 mt-2">매출 현황과 거래 내역을 관리하세요</p>
        </div>
        <button
          onClick={downloadExcelReport}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Excel 보고서 다운로드
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 매출</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.overview.totalRevenue)}</p>
              <p className="text-sm text-green-600">
                {stats.overview.monthlyRevenue > 0 ? `+${formatCurrency(stats.overview.monthlyRevenue)} 이번 달` : '이번 달 매출 없음'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">거래 건수</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalTransactions.toLocaleString()}건</p>
              <p className="text-sm text-gray-600">평균 {formatCurrency(stats.overview.averageOrderValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">일일 매출</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.overview.dailyRevenue)}</p>
              <p className="text-sm text-green-600">
                {stats.overview.weeklyRevenue > 0 ? `+${formatCurrency(stats.overview.weeklyRevenue)} 이번 주` : '이번 주 매출 없음'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">환불률</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.refundRate}%</p>
              <p className="text-sm text-gray-600">전월 대비 -0.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리별 매출 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 매출</h2>
        {stats.revenueByCategory.length > 0 ? (
          <div className="space-y-4">
            {stats.revenueByCategory.map((category, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm text-gray-600">{category.category}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-32 text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(category.revenue)}</div>
                  <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 카테고리별 매출 데이터가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 인기 강의 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 강의 TOP 3</h2>
        {stats.topCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">판매량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매출</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topCourses.map((course, index) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.instructor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.sales}명</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(course.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 판매된 강의가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 최근 거래 내역 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 거래 내역</h2>
        {stats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구매자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 거래 내역이 없습니다.</p>
          </div>
        )}
      </div>

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