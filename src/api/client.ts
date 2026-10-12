import axios from "axios";


const API_URL = import.meta.env.VITE_API_URL

export const TOKEN_KEY ="shop_access_token"
export const REFRESH_KEY = "shop_refresh_token"

export const api =  axios.create( {

    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    }

})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})


api.interceptors.response.use(
    (res)=> res,
    (error)=> {
        if(error.response?.status === 401){
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(REFRESH_KEY)
            if(window.location.pathname !== "/login"){
                window.location.href ="/login";
            }
        }
        return Promise.reject(error)

        }
) 