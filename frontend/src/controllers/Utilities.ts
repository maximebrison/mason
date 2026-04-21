import type { JSXElement, Setter } from "solid-js";
import type { AlertModel } from "../parts/UXElements";
import { format } from "date-fns";

class Utilities{
    public setAlert?: Setter<AlertModel|null>
    public setPopup?: Setter<JSXElement|null>
    public setSpin?: Setter<string|null>

    public formatDate = (date: string | number) => {
        let d: Date
        if(typeof(date) === "number"){
            d = new Date(date*1000)
        } else{
            d = new Date(date);
        }
        return `${format(d, "yyyy/MM/dd")} at ${format(d, "HH:mm")}`
    }

    public preventBodyScroll(state: boolean){
        document.body.style = `overflow: ${(state) ? "hidden": "auto"}`
    }

    public loadSetAlert(setter: Setter<AlertModel|null>){
        this.setAlert = setter;
    }

    public loadSetPopup(setter: Setter<JSXElement|null>){
        this.setPopup = setter;
    }

    public loadSetSpin(setter: Setter<string|null>){
        this.setSpin = setter;
    }

    public spin(msg: string = "Loading..."){
        this.setSpin!(msg);
    }

    public alert(msg: string, fn: Function, refresh: boolean = true){
        this.setAlert!({msg: msg, fn: fn, refresh: refresh});
    }

    public popup(children: JSXElement){
        this.setPopup!(children);
    }

    public closePopup(){
        this.setPopup!(null);
    }

    public stopSpin(){
        this.setSpin!(null);
    }
}

export const utils = new Utilities();