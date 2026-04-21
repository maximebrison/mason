import { createSignal, For, onMount, useContext } from "solid-js";
import { EngineContext } from "../context/EngineContext";
import type { FooterBackgroundModel } from "../controllers/Models";

function Footer(){
    const engine = useContext(EngineContext)!
    const controller = engine.assets;
    const [footerBg, setFooterBg] = createSignal<FooterBackgroundModel|undefined>(undefined)
    const [copyright, setCopyright] = createSignal("©");

    const styleBackground = (background: FooterBackgroundModel|undefined) => {
        if(background && background.show){
            const style = `
                background-image: url(${background.src});
                background-size: ${background.background_size};
                background-position: ${background.background_position};
                background-repeat: ${(background.background_repeat) ? "repeat": "no-repeat"};
            `
            return style;
        }
        return ""
    }
    
    const processCopyright = (rawCopyright: string) => {
        try{
                const date = new Date();
                const processed = rawCopyright.replace("{year}", date.getFullYear().toString());
                setCopyright(processed)
            } catch{
                setCopyright(rawCopyright)
            }
    }

    onMount(() => {
        controller.getPaths().then(() => {
            setFooterBg(controller.paths.footer_bg)
        })

        processCopyright(engine.branding.branding.copyright)
    })
    return(
        <footer
            style={styleBackground(footerBg())}
        >
            <div class="content">
                <div class='external-links'>
                    <For each={engine.branding.branding.social}>
                        {(i) => (
                            <a href={i.url}><i class={i.icon_class}></i></a>
                        )}
                    </For>
                </div>
            </div>
            <span innerHTML={copyright()}></span>
        </footer>
    )
}

export default Footer