import type { NotifModel } from "../parts/UXElements";
import { api } from "./APIController";

export class SessionController{
    public admin?: string

    public async login(form: HTMLFormElement): Promise<NotifModel>{
        const formData = new FormData(form);
        try{
            const res = await api.request("/api/public/auth/login", {
                method: "POST",
                body: formData
            })

            return res;
        } catch(e){
            return {
                success: false,
                msg: "Something went wrong"
            }
        }
    }

    public async logout(): Promise<NotifModel>{
        try{
            const res = await api.request("/api/public/auth/logout", {
                method: "POST"
            })

            return res;
        } catch(e){
            return {
                success: false,
                msg: "Something went wrong"
            }
        }
    }

    public async chechAuth(){
        try{
            const res = await api.request("/api/public/auth/me");
            this.admin = res as string;
        } catch(e){
            this.admin = undefined;
        }
    }

    public async checkUserExists(){
        const payload = new FormData()
        payload.append("user", this.admin!)
        try{
            const res: boolean = await api.request("/api/admin/auth/exists", {
                method: "POST",
                body: payload
            })

            if(!res){
                this.logout()
                window.location.reload()
            }
        } catch(e){
            console.error(e);            
        }
    }

    public async getUsers(){
        try{
            const res = await api.request("/api/admin/auth/get_users")

            return res as [string];
        } catch(e){
            return undefined;
        }
    }

    public async popUser(username: string){
        const formData = new FormData()
        formData.append("username", username)
        try{
            await api.request("/api/admin/auth/pop_user", {
                method: "DELETE",
                body: formData
            })
        } catch(e){
            console.error(e);
        }
    }

    public async changePassword(payload: FormData){
        try{
            await api.request("/api/admin/auth/change_password", {
                method: "PATCH",
                body: payload
            })
        } catch(e){
            console.error(e);
        }
    }

    public async getSignupURL(){
        try{
            const token = await api.request("/api/admin/auth/generate_token")

            return `${window.location.origin}/?page=_signup&token=${token}`
        } catch(e){
            return undefined
        }
    }

    public async validateSignupToken(token: string){
        const payload = new FormData()
        payload.append("token", token)
        try{
            const res = await api.request("/api/public/auth/validate_signup_token", {
                method: "POST",
                body: payload
            })

            return res as boolean
        } catch(e){
            return false
        }
    }

    public async signup(form: HTMLFormElement){
        try{
            const res: NotifModel = await api.request("/api/public/auth/signup", {
                method: "POST",
                body: new FormData(form)
            })

            return res.success
        } catch(e){
            return false
        }
    }
}