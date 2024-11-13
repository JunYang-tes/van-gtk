const defaultCache = weakCache()

export function put(key: any, value: any) {
  defaultCache.put(key, value)
}

export function get(key: any) {
  return defaultCache.get(key)
}

export function weakCache() {
  const data = new WeakMap()
  function put(key: any, value: any) {
    data.set(key, value)
  }
  function get(key: any) {
    return data.get(key)
  }
  return {
    put, get
  }
}
