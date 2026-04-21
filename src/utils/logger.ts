const isDebugEnabled = import.meta.env.DEV

export const debugLog = (...args: unknown[]) => {
  if (isDebugEnabled) {
    console.log(...args)
  }
}
