export async function withDatabaseRetry(fn, maxRetries = 3) {
  let lastError
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (error.code === '26000' || error.code === '42P05') {
        // Wait exponentially longer between retries
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)))
        continue
      }
      throw error
    }
  }
  throw lastError
}