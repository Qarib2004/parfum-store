import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { error } from 'console';
import { config } from 'process';




export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'




export const axiosInstance = axios.create({
    baseURL:API_URL,
    headers:{
        'Content-Type':'applications/json',
    },
    withCredentials:true
})



axios.interceptors.request.use(
    (config:InternalAxiosRequestConfig) => {
        if(typeof window !== 'undefined'){
            const token = localStorage.getItem('accessToken');
            if(token && config.headers){
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error:AxiosError) => {
        return Promise.reject(error)
    }
)



axiosInstance.interceptors.response.use(
    (response) => response,
    async (error:AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
          };
          

        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true 

            try {
                const refreshToken = localStorage.getItem('refreshToken')

                if(refreshToken){
                    const response = await axios.post(`${API_URL}/auth/refresh`,{refreshToken})
                  
                    const {accessToken} = response.data.data
 
                    localStorage.setItem('accessToken',accessToken);

                    


                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                      }
            
                      return axiosInstance(originalRequest);
                    
               
                };

            }  catch (refreshError) {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  window.location.href = '/login';
                }
                return Promise.reject(refreshError);
              }

        }

        return Promise.reject(error);

    }
)


export default axiosInstance;