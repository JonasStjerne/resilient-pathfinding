export function trackTime<T>(func: () => T): T {
  const startTime = performance.now()
  const result = func.apply(null)
  const endTime = performance.now()
  console.log(`Function ${func.name} took ${endTime - startTime}ms to run.`)
  return result
}
