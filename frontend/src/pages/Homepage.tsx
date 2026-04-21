import { createSignal, For, onMount, Show, useContext } from 'solid-js';
import type { BlogPostModel, PageInfo } from '../controllers/Models';
import { EngineContext } from '../context/EngineContext';
import { NavigatorContext } from '../context/NavigatorContext';
import { responsive } from '../controllers/ResponsiveController';

function Homepage(){
    const engine = useContext(EngineContext)!
    const navigator = useContext(NavigatorContext)!
    const featured = engine.pages.featured();
    const lastUpdated: PageInfo|undefined = engine.pages.lastUpdated();
    const [lastBlogPost, setLastBlogPost] = createSignal<[BlogPostModel] | undefined>(undefined);
    const [md, setMd] = createSignal<string>("");
    let asideRef!: HTMLElement;

    const formatDate = (date: string | number) => {
        let d: Date
        if(typeof(date) === "number"){
            d = new Date(date*1000)
        } else{
            d = new Date(date);
        }
        return ` ${d.getFullYear()}/${(d.getMonth()+1 < 10) ? "0" : ""}${d.getMonth()+1}/${(d.getDate() < 10) ? "0" : ""}${d.getDate()} at ${(d.getHours() < 10) ? "0" : ""}${d.getHours()}:${(d.getMinutes() < 10) ? "0" : ""}${d.getMinutes()}`
    }

    onMount(async () => {
        setMd(await engine.pages.getHtml("homepage"))
        setLastBlogPost(await engine.blog.getPosts({
            limit: 1,
        }))

        responsive.setMultiUseButtonLabel("Featured")
        responsive.aside = asideRef;
    })

    return(
        <div class='homepage page'>
            <article class="doc" innerHTML={md()}>

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
                <Show when={featured.length > 0}>
                    <div>
                        <h1>Featured</h1>
                        <div class='featured-list'>
                            <For each={featured}>
                                {(i) => (
                                    <a
                                        class='sidebar-item'
                                        href={`/?page=${i.id}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            navigator.go(i.id)
                                        }}
                                    >
                                        <h1>{i.friendly_name}</h1>
                                        <p>{i.description}</p>
                                    </a>
                                )}
                            </For>
                        </div>
                    </div>
                </Show>
                <Show when={lastUpdated}>
                    <div>
                        <h1>Last updated</h1>
                        <a 
                            class='sidebar-item'
                            href={`/?page=${lastUpdated!.id}`}
                            onClick={(e) => {
                                e.preventDefault()
                                navigator.go(lastUpdated!.id)
                            }}
                        >
                            <h1>{lastUpdated?.friendly_name}</h1>
                            <div class="line">
                                <span class="key">On :</span>
                                <span class="value">{formatDate(lastUpdated!.last_update)}</span>
                            </div>
                            <div class="line">
                                <span class="key">By :</span>
                                <span class="value">{lastUpdated?.last_commit.author}</span>
                            </div>
                            <div class="line">
                                <span class="key">Message :</span>
                                <span class="value">{lastUpdated?.last_commit.message}</span>
                            </div>
                        </a>
                    </div>
                </Show>
                <Show when={lastBlogPost() !== undefined && lastBlogPost()!.length > 0}>
                    <div>
                        <h1>Last blog post :</h1>
                        <a
                            class='sidebar-item'
                            href='/?page=blog'
                            onClick={(e) => {
                                e.preventDefault()
                                navigator.go("blog")
                            }}
                        >
                            <h1>{lastBlogPost()![0].title}</h1>
                            <div class='line'>
                                <div class='key'>On :</div>
                                <div class='value'>{formatDate(lastBlogPost()![0].timestamp)}</div>
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

export default Homepage;