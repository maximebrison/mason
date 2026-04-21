import { For, Match, Switch, useContext } from "solid-js";
import type { ConfigModel } from "../controllers/Models";
import { ToggleButton } from "../parts/UXElements";
import { EngineContext } from "../context/EngineContext";
import { utils } from "../controllers/Utilities";

function Config(){
    const engine = useContext(EngineContext)!

    return(
        <div class="config-page config">
            <h1>General configuration</h1>
            <div class="content">
                <form
                    name="config"
                    onSubmit={(e) => {
                        e.preventDefault()
                        engine.config!.saveConfig(e.currentTarget)
                    }}
                >
                    <For each={Object.entries(engine.config!.config!) as [keyof ConfigModel, ConfigModel[keyof ConfigModel]][]}>
                        {([k, v]) => (
                            <div class="entry">
                                <span class="key">{k}</span>
                                <Switch fallback={<span class="value">{v.toString()}</span>}>
                                    <Match when={typeof(v) === "string"}>
                                        <span class="value">
                                            <input
                                                name={k}
                                                type="text" 
                                                value={v as string}
                                            />
                                        </span>
                                    </Match>
                                    <Match when={typeof(v) === "number"}>
                                        <span class="value">
                                            <input
                                                name={k}
                                                type="number" 
                                                value={v as string}
                                            />
                                        </span>
                                    </Match>
                                    <Match when={typeof(v) === "boolean"}>
                                        <span class="value">
                                            <ToggleButton isOn={v as boolean} inputName={k} />
                                        </span>
                                    </Match>
                                </Switch>
                            </div>
                        )}
                    </For>
                    <div class="entry single">
                        <button type="submit" class="validate">Save</button>
                    </div>
                </form>
                <hr/>
                <div class="entry">
                    <span class="key">Update</span>
                    <span class="value">
                        <button
                            class="sensible"
                            onClick={() => {
                                utils.spin()
                                engine.update().then(() => {
                                    utils.stopSpin()
                                })
                            }}
                        >
                            Execute
                        </button>
                    </span>
                </div>
                <div class="entry">
                    <span class="key">Hard Update</span>
                    <span class="value">
                        <button
                            class="sensible"
                            onClick={() => {
                                utils.spin()
                                engine.hardReload().then(() => {
                                    utils.stopSpin()
                                })
                            }}
                        >
                            Execute
                        </button>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Config;