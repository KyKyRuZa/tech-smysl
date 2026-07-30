export type UserRole = 'ADMIN' | 'EDITOR'

export type ProjectStatus = 'DRAFT' | 'PUBLISHED'

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
