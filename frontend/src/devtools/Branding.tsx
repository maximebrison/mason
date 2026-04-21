import { createSignal, For, useContext } from "solid-js";
import { EngineContext } from "../context/EngineContext";
import { utils } from "../controllers/Utilities";
import type { BrandingModel } from "../controllers/BrandingController";

function Branding(){
    const engine = useContext(EngineContext)!;
    const [branding, setBranding] = createSignal<BrandingModel>(engine.branding.branding)

    return(
        <div class="config-page branding">
            <h1>Branding manager</h1>
            <div class="content">
                <blockquote>
                    Icons are provided by <a href="https://fontawesome.com/">FontAwesome</a> v7.2.0 free (the ability to load your own version will be added in the future).<br/>
                    Search on their website for the icon you want, click on it, copy the <code>class</code> and paste it into the <code>icon</code> input.<br/><br/>
                    Example: <pre>{'<i class="fa-solid fa-carrot"></i>'}</pre> 
                    Use: <pre>fa-solid fa-carrot</pre>
                    Autodetection will be available in v1.1.0.
                </blockquote>
                <h2>Title</h2>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault()
                            const success = await engine.branding.editTitle(e.currentTarget)
                            if(success){
                                engine.branding.get().then(() => {
                                    setBranding(engine.branding.branding)
                                })
                            } 
                        }}
                    >
                        <div class="entry single">
                                <input type="text" name="title" value={branding().title}></input>
                        </div>
                        <div class="entry single">
                                <button type="submit" class="validate">Submit</button>
                        </div>
                    </form>
                <h2>Copyright</h2>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault()
                            const success = await engine.branding.editCopyright(e.currentTarget)
                            if(success){
                                engine.branding.get().then(() => {
                                    setBranding(engine.branding.branding)
                                })
                            } 
                        }}
                    >
                        <div class="entry single">
                                <input type="text" name="copyright" value={branding().copyright}></input>
                        </div>
                        <div class="entry single">
                                <button type="submit" class="validate">Submit</button>
                        </div>
                    </form>
                <h2>Social</h2>
                <div class="sub">
                    <For each={branding().social}>
                        {(i) => (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault()
                                    const success = await engine.branding.removeSocial(e.currentTarget)
                                    if(success){
                                        engine.branding.get().then(() => {
                                            setBranding(engine.branding.branding)
                                            utils.closePopup()
                                        })
                                    }
                                }}
                            >
                                <div class="entry single">
                                    <i class={i.icon_class}></i>
                                    <span class="label">{i.url}</span>
                                    <button type="submit" class="sensible">Delete</button>
                                </div>
                                <input type="hidden" name="icon_class" value={i.icon_class}></input>
                                <input type="hidden" name="url" value={i.url}></input>
                            </form>
                        )}
                    </For>
                </div>
                <div class="entry single">
                    <button 
                        class="validate"
                        onClick={() => {
                            utils.popup(
                                <div class="popup-content">
                                    <h1>Add social link</h1>
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault()
                                            if(!e.currentTarget.noValidate){
                                                const success = await engine.branding.addSocial(e.currentTarget)
                                                if(success){
                                                    engine.branding.get().then(() => {
                                                        setBranding(engine.branding.branding)
                                                        utils.closePopup()
                                                    })
                                                }
                                            }
                                        }}
                                    >
                                        <div class="entry">
                                            <div class="key">Icon</div>
                                            <div class="value"><input type="text" name="icon_class" required={true} placeholder="icon"></input></div>
                                        </div>
                                        <div class="entry">
                                            <div class="key">URL</div>
                                            <div class="value"><input type="text" name="url" required={true} placeholder="url"></input></div>
                                        </div>
                                        <div class="entry single">
                                            <button type="submit" class="validate">Submit</button>
                                        </div>
                                    </form>
                                </div>
                            )
                        }}
                    >
                        Add link
                    </button>
                </div>
            </div>
            <div class="bottom">
            </div>
        </div>
    )
}

export default Branding;