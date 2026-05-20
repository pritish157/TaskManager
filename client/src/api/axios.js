import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    withCredentials: true // sends cookies (refresh token) with every request
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If 401, try refreshing the token once
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await api.get('/auth/refresh-token');
                localStorage.setItem('access_token', data.token.access_token);
                originalRequest.headers.Authorization = `Bearer ${data.token.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
