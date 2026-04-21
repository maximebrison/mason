import { createSignal, onMount } from "solid-js";
import "./css/logs.css"
import { LogsController } from "../controllers/LogsController";

function Logs(){
    const controller = new LogsController();
    const [logs, setLogs] = createSignal<string>("");
    let logsRef!: HTMLPreElement;

    onMount(async () => {
        const res: string = await controller.getLogs()
        setLogs(res)
        logsRef.scrollTo(0, logsRef.scrollHeight)
    })
    return(
        <div class="config-page logs">
            <h1>Logs</h1>
            <div class="content">
                <pre ref={logsRef}>{logs()}</pre>
            </div>
            <div class="bottom">
                <button 
                    class="sensible"
                    onClick={async () => {
                        controller.clearLogs().then(async () => {
                            setLogs(await controller.getLogs())
                        })
                    }}
                >
                    Clear logs
                </button>
            </div>
        </div>
    )
}

export default Logs;