const API_URL = 'https://jsonplaceholder.typicode.com'
export async function fetchUsers() {
const response = await fetch(`${API_URL}/users`)
if (!response.ok) {
throw new Error(`HTTP ${response.status}`)
}
return response.json()
}
