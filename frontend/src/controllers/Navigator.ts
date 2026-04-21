import type { Setter } from "solid-js";
import { responsive } from "./ResponsiveController";

export class Navigator{
    private setPage?: Setter<string>;

    constructor (){
        window.addEventListener("popstate", () => {
            this.go(this.getPage(), true);
        });
    }

    public loadSetPage(setter: Setter<string>){
        this.setPage = setter;
    }

    public go(page: string, back: boolean = false, redirect: boolean = false, clear: boolean = false){
        if(!back){
            let url: URLSearchParams
            if(!clear){
                url = new URLSearchParams(document.location.search);
            } else{
                url = new URLSearchParams();
            } 

            url.set("page", page.toLowerCase());

            if(redirect){
                url.set("source", this.getPage())
            } else if(url.has("source")){
                url.delete("source")
            }
            

            history.pushState({page: page}, "", `?${url.toString()}`);
        }

        this.setPage!("_");
        this.setPage!(page);
        responsive.checkMedia()
        try{
            if(!responsive.desktop){
                responsive.toggleNavbox(false)
            }
        } catch{
            null
        }
    }

    public reload(){
        const page = this.getPage();
        this.setPage!("_");
        this.setPage!(page);
    }

    public getPage(){
        const url = new URLSearchParams(document.location.search);
        const page = url.get("page");
        if(page){
            return page;
        } else {
            return "home"
        }
    }

    public getUrlItem(key: string){
        const url = new URLSearchParams(document.location.search);
        const item = url.get(key);
        if(item){
            return item;
        } else {
            return undefined
        }
    }
}