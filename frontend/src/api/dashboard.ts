import type { DashboardSummary } from '@/types/admin'
import { get } from './http'

export async function getSummary(): Promise<DashboardSummary> {
  return get('/admin/dashboard/summary')
}
