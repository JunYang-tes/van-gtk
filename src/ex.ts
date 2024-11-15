const defaultCache = weakCache()

export function put(key: any, value: any) {
  defaultCache.put(key, value)
}

export function get(key: any) {
  return defaultCache.get(key)
}

export function weakCache<K extends WeakKey = WeakKey, V = any>() {
  const data = new WeakMap()
  function put(key: K, value: V) {
    data.set(key, value)
  }
  function get(key: K) {
    return data.get(key) as V
  }
  return {
    put, get
  }
}

export const widgetsRemoveCallback = weakCache()
