const baseURL = `${import.meta.env.server_url}/api`;

async function apiFetch(path, options) {
    const res = await fetch(`${baseURL}${path}`, options);
    return res;
}

export default {
    apiFetch
}