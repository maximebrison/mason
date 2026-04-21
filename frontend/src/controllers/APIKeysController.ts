import { api } from "./APIController";
import type { APIKeyModel, NotifModel } from "./Models";

export class APIKeysController{
    mode?: "ConfigFlow" | "Admin"

    constructor(mode: "ConfigFlow" | "Admin"){
        this.mode = mode;
    }
        /**
     * Fetches all entries from `api_keys` row in mason.db
     * 
     * @returns a `list` containing APIKeys entries 
     * @example
     * ```js 
     * [id, provider, username]
     * ```
     */
    public async getKeys(): Promise<[APIKeyModel]|[]>{
        let url = "/api/config_flow/api_keys/get"
        if(this.mode === "Admin"){
            url = "/api/admin/api_keys/get"
        }
        try{
            const res = await api.request(url)
            return res
        } catch(e){
            return []
        }
    }

    public async getAvailableProviders(): Promise<[string]|[]>{
        let url = "/api/config_flow/api_keys/available_providers"
        if(this.mode === "Admin"){
            url = "/api/admin/api_keys/available_providers"
        }
        try{
            const res = await api.request(url);
            return res
        } catch(e){
            return []
        }
        
    }

    public async insertKey(form: HTMLFormElement): Promise<boolean>{
        let url = "/api/config_flow/api_keys/insert"
        if(this.mode === "Admin"){
            url = "/api/admin/api_keys/insert"
        }
        try{
            const res: NotifModel = await api.request(url, {
                method: "POST",
                body: new FormData(form)
            })
            return res.success
        } catch(e){
            return false
        }
    }

    public async popKey(key_id: number){
        let url = "/api/config_flow/api_keys/pop"
        if(this.mode === "Admin"){
            url = "/api/admin/api_keys/pop"
        }
        try{
            const res: NotifModel = await api.request(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key_id: key_id
                })
            });

            return res.success
        } catch(e){
            return false
        }
    }

    public async makePrimary(key_id: number){
        let url = "/api/config_flow/api_keys/make_primary"
        if(this.mode === "Admin"){
            url = "/api/admin/api_keys/make_primary"
        }
        try{
            const res: NotifModel = await api.request(url, {
                method: "POST",
                headers:{
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({
                    key_id: key_id
                })
            })

            return res.success
        } catch(e){
            return false
        }
    }
}