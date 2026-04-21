import { createStore } from "solid-js/store"
import { ColorsController } from "../controllers/ColorsController"
import { For, onMount, Show } from "solid-js"
import type { ColorsModel } from "../controllers/Models"

type ColorsState = {
    model: ColorsModel | null
}

function Colors(){
    const controller = new ColorsController()
    const [colors, setColors] = createStore<ColorsState>({model: null})

    onMount(() => {
        controller.getColors().then(() => {
            setColors("model", structuredClone(controller.colors))
        })
    })
    return(
        <div class="config-page colors">
            <h1>Colors editor</h1>
            <div class="content">
                <Show when={colors.model !== null}>
                    <h2>Dark theme</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            controller.saveColors("dark", e.currentTarget)
                        }}
                    >
                        <For each={Object.entries(colors.model!.dark) as [keyof ColorsModel["dark"], ColorsModel["dark"][keyof ColorsModel["dark"]]][]}>
                            {([k, v]) => (
                                <div class="entry">
                                    <span class="key">{k}</span>
                                    <span class="value">
                                        <span class="inline-button" style={`background-color: #${v}!important;`}></span>
                                        <input
                                            onInput={(e) => {
                                                const display = e.currentTarget.parentElement!.querySelectorAll('span')
                                                display[0].style = `background-color: #${e.currentTarget.value}!important;`
                                            }}
                                            type="text"
                                            name={k}
                                            value={v}
                                        >

                                        </input>
                                        #
                                    </span>
                                </div>
                            )}
                        </For>
                        <div class="entry single">
                            <button type="submit" class="validate">Submit</button>
                        </div>
                    </form>
                    <h2>Light theme</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            controller.saveColors("light", e.currentTarget)
                        }}
                    >
                        <For each={Object.entries(colors.model!.light) as [keyof ColorsModel["light"], ColorsModel["light"][keyof ColorsModel["light"]]][]}>
                            {([k, v]) => (
                                <div class="entry">
                                    <span class="key">{k}</span>
                                    <span class="value">
                                        <span class="inline-button" style={`background-color: #${v}!important;`}></span>
                                        <input
                                            onInput={(e) => {
                                                const display = e.currentTarget.parentElement!.querySelectorAll('span')
                                                display[0].style = `background-color: #${e.currentTarget.value}!important;`
                                            }}
                                            type="text"
                                            name={k}
                                            value={v}
                                        >

                                        </input>
                                        #
                                    </span>
                                </div>
                            )}
                        </For>
                        <div class="entry single">
                            <button type="submit" class="validate">Submit</button>
                        </div>
                    </form>
                </Show>
            </div>
            <div class="bottom">
                <button 
                    class="sensible"
                    onClick={() => {
                        setColors("model", structuredClone(controller.colors))
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    )
}

export default Colors