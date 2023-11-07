export function trackTime(func: Function) {
  const startTime = performance.now()
  const result = func.apply(this)
  const endTime = performance.now()
  console.log(`Function ${func.name} took ${endTime - startTime}ms to run.`)
  return result
}
