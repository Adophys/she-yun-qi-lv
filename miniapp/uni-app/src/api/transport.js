export function request(options) {
  return new Promise((resolve, reject) => {
    const task = uni.request({
      ...options,
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    })

    return () => task.abort()
  })
}
