export function trackTime<T>(func: () => T): { result: T; deltaTime: number } {
  const startTime = performance.now()
  const result = func.apply(null)
  const endTime = performance.now()
  console.log(`Function ${func.name} took ${endTime - startTime}ms to run.`)
  const deltaTime = endTime - startTime
  return { result, deltaTime }
}
