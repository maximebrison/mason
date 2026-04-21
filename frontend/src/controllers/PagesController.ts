import { api } from "./APIController";
import type { FilterPageModel, PageInfo } from "./Models";

export class PagesController{
    public index: PageInfo[] = []
    public homepage?: PageInfo
    public navbarPages?: string[]

    public async init(){
        this.index = await this.getIndex({
            shown: true
        })
        
        this.homepage = await this.getIndex({
            homepage: true
        })
    }

    public async getIndex(filters: Partial<FilterPageModel> = {}){
        const params = api.toQueryModel(filters)
        try{
            const res = api.request(`/api/public/index/get?${params}`)
            return res
        } catch(e){
            console.error(e);
            return []
        }
    }

    public async getNavbar(){
        const res = await fetch("/api/public/index/get_navbar");
        this.navbarPages =  await res.json();
    }

    public async saveIndex(form: HTMLFormElement){
        try{
            await api.request("/api/admin/index/update", {
                method: "PUT",
                body: new FormData(form)
            })
        } catch(e){
            console.error(e);
        }
    }

    public async getHtml(dir: string){
        const res = await fetch(`/repos/${dir}/index.html`, {
            method: "GET"
        })

        return await res.text();
    }

    public lastUpdated(){
        if (this.index.length === 0) return undefined;
        let lastUpdated = this.index[0];
        this.index.forEach((r) => {
            (new Date(r.last_update) > new Date(lastUpdated.last_update)) ? lastUpdated = r : null;
        })
        return lastUpdated;
    }

    public featured(){
        return this.index.filter((p) => p.featured === true)
    }

    public getFriendlyNameFromId(id: string){
        const page = this.index.filter((p) => p.id === id)[0];
        if(page){
            return page.friendly_name;
        }
        return id.charAt(0).toUpperCase() + id.slice(1)
    }
}