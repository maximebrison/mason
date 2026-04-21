import { createSignal, onMount, Show, useContext } from "solid-js";
import "./css/page.css"
import type { PageInfo, BlogPostModel } from "../controllers/Models";
import { EngineContext } from "../context/EngineContext";
import { NavigatorContext } from "../context/NavigatorContext";
import { utils } from "../controllers/Utilities";
import { responsive } from "../controllers/ResponsiveController";

function Page(info: PageInfo){
    const engine = useContext(EngineContext)!;
    const navigator = useContext(NavigatorContext)!;
    const [md, setMd] = createSignal<string>("");
    const [outline, setOutline] = createSignal<ChildNode|null>(null);
    const [lastBlogPost, setLastBlogPost] = createSignal<[BlogPostModel]|undefined>(undefined);
    let mdRef!: HTMLDivElement;
    let outlineRef!: HTMLDivElement;
    let asideRef!: HTMLElement;

    const removeSelected = () => {
        outlineRef.querySelector(".selected")?.classList.remove("selected");
    }

    onMount(async () => {
        setMd(await engine.pages.getHtml(info.id))
        engine.showOutline(mdRef, setOutline)

        for(let l of outlineRef.querySelectorAll("a")){
            l.addEventListener("click", () => {
                removeSelected();
                l.classList.add("selected");
            })
        }
        setLastBlogPost(await engine.blog.getPosts({
            limit: 1,
            linked_page: info.id
        }))

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
                <div class="info">
                    <h1>More info</h1>
                    <blockquote>
                        <Show when={!info.private}>
                            <div class="line">
                                <span class="key">{info.provider} :</span>
                                <span class="value"><a href={info.url}>{info.friendly_name}</a></span>
                            </div>
                        </Show>
                        <div class="line">
                            <span class="key">Created :</span>
                            <span class="value">{utils.formatDate(info.created)}</span>
                        </div>
                        <div class="line">
                            <span class="key">Last update :</span>
                            <span class="value">{utils.formatDate(info.last_update)}</span>
                        </div>
                    </blockquote>
                </div>
                <Show when={lastBlogPost() !== undefined && lastBlogPost()!.length > 0}>
                    <div>
                        <h1>Last blog post :</h1>
                        <a
                            class='sidebar-item'
                            href={`/?page=blog&source=${info.id}`}
                            onClick={(e) => {
                                e.preventDefault()
                                navigator.go("blog", false, true)
                            }}
                        >
                            <h1>{lastBlogPost()![0].title}</h1>
                            <div class='line'>
                                <div class='key'>On :</div>
                                <div class='value'>{utils.formatDate(lastBlogPost()![0].timestamp)}</div>
                            </div>
                            <div class='line'>
                                <div class='key'>Topic :</div>
                                <div class='value'>{(lastBlogPost()![0].linked_page !== "main") ? engine.pages.getFriendlyNameFromId(lastBlogPost()![0].linked_page): "main"}</div>
                            </div>
                        </a>
                    </div>
                </Show>
            </aside>
        </div>
    )
}

export default Page;