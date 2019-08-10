const domain = '192.168.0.103'
const port = '3000'

const _fetch = async (url, data) => {
	return await fetch(url, {
		method: 'POST',
		mode: 'cors',
		headers:{
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}).then(res => res.text())
}