import { api, TOKEN_KEY,REFRESH_KEY } from "./client"


export type role = "OWNER" | "MANAGER" |"CASHIER" | "STOCKMANAGER"


export type Me  = {
    id : number,
    username:string,
    role : role,
}


export async function login(username:string,password :string){
    const {data} = await api.post("/auth/token/",{username,password})
    localStorage.setItem(TOKEN_KEY,data.access) 
    localStorage.setItem(REFRESH_KEY,data.refresh)
    return data 

}

export async function fetchMe():Promise<Me>{
    const {data } = await api.get("/auth/me/")
    return data

}
export function logout(){
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    
}
export function isAuthenticated(){
    return !!localStorage.getItem(TOKEN_KEY)
}
