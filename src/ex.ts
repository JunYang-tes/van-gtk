const data = new WeakMap()
export function put(key: any, value: any) {
  data.set(key, value)
}
export function get(key: any) {
  return data.get(key)
}
