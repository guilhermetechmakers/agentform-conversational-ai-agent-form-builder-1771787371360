export type OperationStatus = 'pending' | 'success' | 'error'

export type OperationType = 'publish' | 'delete' | 'webhook_replay' | 'export' | string

export interface OperationLog {
  id: string
  operationType: OperationType
  status: OperationStatus
  progress: number
  message: string | null
  timestamp: string
}

export interface OperationsListResponse {
  operations: OperationLog[]
}

export interface OperationUpdateRequest {
  status?: OperationStatus
  progress?: number
  message?: string | null
}
