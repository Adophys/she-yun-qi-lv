import { http } from './http'

export async function getCulturalItems(params = {}) {
  return http.get('/cultural-items?' + new URLSearchParams(params).toString())
}

export async function getCulturalItem(id) {
  return http.get(`/cultural-items/${id}`)
}
