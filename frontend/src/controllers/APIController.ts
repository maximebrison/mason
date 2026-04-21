import type { NotifModel } from "./Models"
import type { Setter } from "solid-js"

class APIController{
    private setNotif?: Setter<NotifModel|null> = undefined;

    public init(setter: Setter<NotifModel|null>){
        this.setNotif = setter;
    }

    public notif(notif: NotifModel){
        this.setNotif!(null)
        this.setNotif!(notif)
    }

    private isNotifModel(data: unknown): data is NotifModel{
        return typeof data === "object" && data !== null && "success" in data && "msg" in data
    }

    /**
     * Generates an URLSearchParams object from any Record<string, unknown> 
     * @param obj 
     * @returns 
     */
    public toQueryModel(obj: Record<string, unknown> | null | undefined): URLSearchParams{
        if(!obj){
            return new URLSearchParams()
        }
        return new URLSearchParams(
            Object.fromEntries(
                Object.entries(obj)
                    .filter(([_, v]) => v !== null && v !== undefined)
                    .map(([k, v]) => [k, String(v)])
            )
        )
    }

    public async request(endpoint: RequestInfo | URL, init?: RequestInit, silent: boolean = false): Promise<any|string>{
        const res = await fetch(endpoint, init)

        let data;
        switch (res.status){
            case 401:
                data = await res.json();
                if (!silent) this.notif!(data.detail as NotifModel);
                throw new Error("401");

            case 403:
                data = await res.json();
                if (!silent) this.notif!(data.detail as NotifModel);
                window.location.reload()
                throw new Error("401");

            case 422:
                data = await res.json();
                if(!silent){
                    this.notif!({
                        success: false,
                        msg: `Unprocessable content... \n${data.detail[0].loc[1]}: ${data.detail[0].msg}`
                    })
                }
                throw new Error("422");

            case 429:
                data = await res.json()
                if (!silent) {
                    this.notif!({
                        success: false,
                        msg: data.detail
                    })
                }
                throw new Error("429")

            case 500:
                if (!silent) this.notif!({success: false, msg: "Internal Server Error"});
                throw new Error("500");
        }

        if (res.ok){
            const type = res.headers.get("content-type");
            if(type){
                if(type.includes("application/json")){
                    const data = await res.json()
                    if(this.isNotifModel(data)){
                        if (!silent) this.notif!(data);
                    }
                    return data
                }
                if(type.includes("text/html")){
                    return await res.text()
                }
            }
            return await res.text()
        }
    }
}
export const api = new APIController()