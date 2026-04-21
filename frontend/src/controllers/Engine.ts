import { type Setter } from "solid-js"
import { SessionController } from "./SessionController"
import { PagesController } from "./PagesController"
import { ConfigController } from "./ConfigController"
import { api } from "./APIController";
import { BlogController } from "./BlogController";
import { AssetsController } from "./AssetsController";
import { BrandingController } from "./BrandingController";
import { responsive } from "./ResponsiveController";

export class Engine{
    public config: ConfigController = new ConfigController();
    public session: SessionController = new SessionController();
    public pages: PagesController = new PagesController();
    public blog: BlogController = new BlogController();
    public assets: AssetsController = new AssetsController();
    public branding: BrandingController = new BrandingController();

    public async run(){
        await this.pages.init();
        await this.pages.getNavbar();
        await this.session.chechAuth();
        await this.config.getConfig();
        await this.branding.get();

        if(this.session.admin){
            this.session.checkUserExists()
        }
    }

    public preventBodyScroll(state: boolean){
        document.body.style = `overflow: ${(state) ? "hidden": "auto"}`
    }

    public async update(){
        try{
            await api.request("/api/admin/utils/update")
        } catch(e){
            console.error(e);
        }        
    }

    public async hardReload(){
        try{
            await api.request("/api/admin/utils/hard_update")
        } catch(e){
            console.error(e);
        }  
    }

    public showOutline(md: HTMLDivElement, setter: Setter<ChildNode|null>){
        const outline = document.createElement("ul")
        let lastNodeIndex = 0;
        let lastNode = outline;
        for(let c of md.children){
            let hN = Number(c.nodeName.replace("H", ""));
            if(hN){
                if(hN > lastNodeIndex){
                    const list = document.createElement("ul");
                    const line = document.createElement("li");
                    const link = document.createElement("a");
                    link.innerHTML = c.textContent;
                    link.addEventListener("click", () => {
                        responsive.toggleAside()
                        c.scrollIntoView({behavior: "smooth", block: "start"});
                    });
                    line.appendChild(link);
                    list.appendChild(line);
                    lastNode.appendChild(list);
                    lastNode = list;
                    if(hN - lastNodeIndex > 1){
                        lastNodeIndex = lastNodeIndex + 1;
                    } else{
                        lastNodeIndex = hN;
                    }
                } else if(hN == lastNodeIndex){
                    const line = document.createElement("li");
                    const link = document.createElement("a");
                    link.innerHTML = c.textContent;
                    link.addEventListener("click", () => {
                        responsive.toggleAside()
                        c.scrollIntoView({behavior: "smooth", block: "start"});
                    });
                    line.appendChild(link);
                    lastNode.appendChild(line);
                    lastNodeIndex = hN;
                } else{
                    for(let i = 0; i < lastNodeIndex-hN; i++){
                        lastNode = lastNode.parentElement! as HTMLUListElement;
                    }
                    const line = document.createElement("li");
                    const link = document.createElement("a");
                    link.innerHTML = c.textContent;
                    link.addEventListener("click", () => {
                        responsive.toggleAside()
                        c.scrollIntoView({behavior: "smooth", block: "start"});
                    });
                    line.appendChild(link);
                    lastNode.appendChild(line);
                    lastNodeIndex = hN;
                }
            }
        }
        setter(outline.firstChild)
    }
}