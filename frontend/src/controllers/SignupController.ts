import { api } from "./APIController";
import type { NotifModel } from "./Models";

export class SignupController{
    public async createUser(form: HTMLFormElement){
        try{
            const res: NotifModel = await api.request("/api/config_flow/auth/create_user", {
                method: "POST",
                body: new FormData(form)
            })

            return res.success
        } catch(e){
            return false
        }
    }

    public async firstLogin(form: HTMLFormElement){
        try{
            const res: NotifModel = await api.request("/api/config_flow/first_run")

            if(res.success){  
                await api.request("/api/public/auth/login", {
                    method: "POST",
                    body: new FormData(form)
                })

                return true
            } else{
                return false
            }
        } catch(e){
            return false
        }
    }
}