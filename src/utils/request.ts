// https://dmitripavlutin.com/javascript-async-await/
export async function makeRequest(url:string) {
  const response = await fetch(url)
  
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`
    throw new Error(message)
  }

  const resp = await response.json()
  console.log(resp);
  return resp
  
}
