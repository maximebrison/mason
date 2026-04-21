import { createSignal, onMount, useContext } from "solid-js";
import "./css/page.css"
import { EngineContext } from "../context/EngineContext";
import { responsive } from "../controllers/ResponsiveController";

function NavbarPage(props: {dir: string}){
    const engine = useContext(EngineContext)!
    const [md, setMd] = createSignal<string>("");
    const [outline, setOutline] = createSignal<ChildNode|null>(null)
    let mdRef!: HTMLDivElement;
    let outlineRef!: HTMLDivElement;
    let asideRef!: HTMLElement;

    const removeSelected = () => {
        outlineRef.querySelector(".selected")?.classList.remove("selected");
    }

    onMount(async () => {
        setMd(await engine.pages.getHtml(props.dir))
        engine.showOutline(mdRef, setOutline)

        for(let l of outlineRef.querySelectorAll("a")){
            l.addEventListener("click", () => {
                removeSelected();
                l.classList.add("selected");
            })
        }

        responsive.setMultiUseButtonLabel("Outline")
        responsive.aside = asideRef;
    })
    return(
        <div 
            class="page"
        >
            <article
                class="doc"
                innerHTML={md()}
                ref={mdRef}
            >

            </article>
            <aside
                ref={asideRef}
            >
                <button 
                    class='close'
                    onClick={() => responsive.toggleAside()}
                >
                    <i class="fa-solid fa-x"></i>
                </button>
                <div>
                    <h1>Outline</h1>
                    <div 
                        class="outline"
                        ref={outlineRef}
                    >
                        {outline()}
                    </div>
                </div>
            </aside>
        </div>
    )
}

export default NavbarPage;