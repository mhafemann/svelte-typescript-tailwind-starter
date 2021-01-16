export async function getData(url) {
  var requestOptions = {
    method: 'GET',
    mode: 'cors',
    credentials: 'same-origin',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  // @ts-ignore
  const res = await fetch(url, requestOptions)

  const text = await res.text()
		if (res.ok) {
			return JSON.parse(text)
		} else {
			throw new Error(text)
		}
}
