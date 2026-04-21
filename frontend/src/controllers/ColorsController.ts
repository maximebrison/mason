import { api } from "./APIController";
import type { ColorsModel } from "./Models";


export class ColorsController{
    public colors!: ColorsModel;

    async getColors(){
        try{
            const colors: ColorsModel = await api.request("/api/admin/colors/get", {
                method: "GET"
            });

            this.colors = colors;
        } catch(e){
            console.error(e);
        }
    }

    async saveColors(theme: "dark" | "light", form: HTMLFormElement){
        try{
            await api.request(`/api/admin/colors/set_${theme}`, {
                method: "POST",
                body: new FormData(form)
            })
        } catch(e){
            console.error(e);
        }
    }
}