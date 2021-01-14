export const writeToClipboard = async (text:string, callback:CallableFunction) => {
  try {
    await navigator.clipboard.writeText(text)
    return callback()
  } catch (error) {
    console.error(error)
  }
}