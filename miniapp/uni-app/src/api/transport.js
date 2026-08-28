/**
 * 传输层：封装 uni.request，提供超时能力，并把网络层失败归一为 ApiError。
 */
import { ApiError } from './errors'

export function request(options) {
  const DEFAULT_TIMEOUT = 15000
  return new Promise((resolve, reject) => {
    const task = uni.request({
      ...options,
      timeout: options.timeout || DEFAULT_TIMEOUT,
      success: (res) => resolve(res),
      fail: (err) => {
        const error = new ApiError('NETWORK_ERROR', err.errMsg || '网络请求失败')
        reject(error)
      },
    })

    // 返回取消函数（需要中断时可调用）
    return () => task.abort()
  })
}
