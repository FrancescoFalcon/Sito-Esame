export async function request(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`/api${endpoint}`, config);
    
    let data;
    const text = await res.text();
    try {
        data = JSON.parse(text);
    } catch {
        console.error('Server response was not JSON:', text);
        throw new Error(`Server Error: ${res.status} ${res.statusText}`);
    }

    if (!res.ok) throw new Error(data.message || data.error || 'Error');
    return data;
}
