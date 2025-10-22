declare global {
  interface Window {
    TossPayments: (clientKey: string) => TossPaymentsInstance
  }
}

interface TossPaymentsInstance {
  requestPayment: (
    method: string,
    options: {
      amount: number
      orderId: string
      orderName: string
      customerName: string
      successUrl: string
      failUrl: string
    }
  ) => Promise<void>
}

export {}
