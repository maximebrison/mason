import { api } from "./APIController"
import type { NotifModel } from "./Models"

export type SocialModel = {
    icon_class: string,
    url: string
}

export type BrandingModel = {
    title: string,
    copyright: string,
    social: [SocialModel]
}

export class BrandingController{
    branding!: BrandingModel
    title = document.getElementById("title")!;

    public async get(){
        try{
            const res: BrandingModel = await api.request("/api/public/branding/get");
            this.branding = res
            this.title.innerText = res.title
            return res
        } catch(e){
            console.error(e);            
        }
    }

    public async editTitle(form: HTMLFormElement){
        const payload = new FormData(form)
        try{
            const res: NotifModel = await api.request("/api/admin/branding/edit_title", {
                method: "PATCH",
                body: payload
            })

            return res.success
        } catch(e){
            console.error(e);
            return false
        }
    }

    public async editCopyright(form: HTMLFormElement){
        const payload = new FormData(form)
        try{
            const res: NotifModel = await api.request("/api/admin/branding/edit_copyright", {
                method: "PATCH",
                body: payload
            })

            return res.success
        } catch(e){
            console.error(e);
            return false
        }
    }

    public async addSocial(form: HTMLFormElement){
        const payload = new FormData(form)
        try{
            const res: NotifModel = await api.request("/api/admin/branding/add_social", {
                method: "PUT",
                body: payload
            })

            return res.success
        } catch(e){
            console.error(e);
            return false
        }
    }

    public async removeSocial(form: HTMLFormElement){
        const payload = new FormData(form)
        try{
            const res: NotifModel = await api.request("/api/admin/branding/remove_social", {
                method: "DELETE",
                body: payload
            })

            return res.success
        } catch(e){
            console.error(e);
            return false
        }
    }

    public async update(payload: BrandingModel){
        try{
            await api.request("/api/admin/branding/update", {
                method: "PUT",
                body: JSON.stringify(payload)
            })
        } catch(e){
            console.error(e);
        }
    }
}