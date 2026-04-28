export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type PageResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

