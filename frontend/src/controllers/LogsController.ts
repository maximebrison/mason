import { api } from "./APIController"

export class LogsController{
    public async getLogs(){
        try{
            const data: string = await api.request("/api/admin/logs/get")

            return data
        } catch(e){
            console.error(e);
            return ""
        }
    }

    public async clearLogs(){
        try{
            await api.request("/api/admin/logs/clear")
        } catch(e){
            console.error(e);
        }
    }
}