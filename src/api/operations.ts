import { apiGet, apiPatch } from '@/lib/api'
import type {
  OperationsListResponse,
  OperationLog,
  OperationUpdateRequest,
} from '@/types/operations'

export async function fetchOperations(): Promise<OperationsListResponse> {
  return apiGet<OperationsListResponse>('/operations')
}

export async function updateOperation(
  id: string,
  payload: OperationUpdateRequest
): Promise<OperationLog> {
  return apiPatch<OperationLog>(`/operations/${id}`, payload)
}
