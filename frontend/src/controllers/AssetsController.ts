import { api } from "./APIController";
import type { AssetsPaths } from "./Models";

export class AssetsController{
    paths!: AssetsPaths

    public async upload2(form: HTMLFormElement){
        let url: string = ""
        switch(form.name){
            case "banner_logo":
                url = "/api/admin/assets/upload/banner_logo"
                break;
            case "banner_bg":
                url = "/api/admin/assets/upload/banner_bg"
                break;
            case "footer_bg":
                url = "/api/admin/assets/upload/footer_bg"
                break;
            case "site_icon":
                url = "/api/admin/assets/upload/site_icon"
                break;
        }
        await api.request(url, {
            method: "PUT",
            body: new FormData(form)
        })
    }

    public async loadSiteIcon(){
        const link = document.getElementById("icon") as HTMLLinkElement;
        this.getPaths().then(() => {
            link.href = this.paths.site_icon;
        })
    }

    public async getPaths(){
        const res = await fetch("/api/public/assets/get_paths")

        this.paths = await res.json() as AssetsPaths        
    }
}