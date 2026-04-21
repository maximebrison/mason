import { createSignal, For, onMount, Show } from "solid-js";
import "./css/api-keys.css"
import { APIKeysController } from "../controllers/APIKeysController";
import type { APIKeyModel } from "../controllers/Models";
import { utils } from "../controllers/Utilities";

function ApiKeys(){
    const controller = new APIKeysController("Admin");
    const [keys, setKeys] = createSignal<[APIKeyModel] | []>([]);
    const [availableProviders, setAvailableProviders] = createSignal<[string]|[]>([]);

    onMount(() => {
        controller.getKeys().then((data) => {
            setKeys(data);
        })

        controller.getAvailableProviders().then((data) => {
            setAvailableProviders(data);
        })
    })
    return(
        <div class="config-page api-keys">
            <h1>API keys</h1>
            <div class="content">
                <blockquote>
                    The primary key (outlined yellow) is the one that decides which provider to use for fetching homepage and right-navbar items.<br/>
                    It's based on your main repo :
                    <pre>{"https://provider.com/{username}/{username}"}</pre>
                    Don't forget to update <code>Server settings {">"} General configuration {">"} Update</code> after changing the primary key.
                </blockquote>
                <For each={keys()}>
                    {(k) => (
                        <div class="loaded-key">
                            <span class={`key ${(k.is_primary) ? "primary" : ""}`}>{k.provider}/{k.username}</span>
                            <Show when={!k.is_primary}>
                                <span
                                    title="Make primary"
                                    class="inline-button"
                                    onClick={async () => {
                                        utils.spin()
                                        const success = await controller.makePrimary(k.id);
                                        if(success){
                                            setKeys(await controller.getKeys())
                                        }
                                        utils.stopSpin()
                                    }}
                                >
                                    <i class="fa-regular fa-star"></i>
                                </span>
                            </Show>
                            <span
                                title="Delete key"
                                class="inline-button"
                                onClick={async () => {
                                    utils.spin()
                                    const success = await controller.popKey(k.id);
                                    if(success){
                                        setKeys(await controller.getKeys())
                                    }
                                    utils.stopSpin()
                                }}
                            >
                                <i class="fa-solid fa-trash-can"></i>
                            </span>
                        </div>
                    )}
                </For>
            </div>
            <div class="bottom">
                <form
                    onSubmit={async (e) => {
                        utils.spin()
                        e.preventDefault();
                        const success = await controller.insertKey(e.currentTarget);
                        if(success){
                            setKeys(await controller.getKeys())
                        }
                        utils.stopSpin()
                    }}
                >
                    <select
                        name="provider"
                    >
                        <For each={availableProviders()}>
                            {(p) => (
                                <option value={p}>{p}</option>
                            )}
                        </For>
                    </select>
                    <input type="text" name="key" placeholder="API_KEY"></input>
                    <button
                        type="submit"
                        class="inline validate"
                    >
                        +
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ApiKeys