import { createEffect, createSignal, For, onCleanup, onMount, Show, useContext, type Setter } from "solid-js"
import "./css/blog.css"
import { EngineContext } from "../context/EngineContext"
import type { BlogPostModel } from "../controllers/Models";
import { utils } from "../controllers/Utilities";
import { NavigatorContext } from "../context/NavigatorContext";
import { Pagination } from "../parts/UXElements";
import { responsive } from "../controllers/ResponsiveController";

function Blog(){
    const engine = useContext(EngineContext)!;
    const navigator = useContext(NavigatorContext)!;
    const [posts, setPosts] = createSignal<[BlogPostModel]|undefined>(undefined);
    const [pagesCount, setPagesCount] = createSignal<number>(0);
    const [page, setPage] = createSignal<number>(0);
    const [linkedPage, setLinkedPage] = createSignal<string|undefined>(undefined);
    const [elemPerPage, setElemPerPage] = createSignal<number>(5);
    const [from, setFrom] = createSignal<number>(NaN);
    const [to, setTo] = createSignal<number>(NaN);
    let asideRef!: HTMLElement;

    const initInterface = async (
        linkedPage: string | undefined = undefined, 
        page: number = 0, 
        elemPerPage: number = 5,
        from: number = NaN,
        to: number = NaN
    ) => {        
        const fullIndex = await engine.blog.getPosts({
            linked_page: linkedPage,
            start_date: (Number.isNaN(from)) ? undefined : from,
            end_date: (Number.isNaN(to)) ? undefined : to,
        })
        setPagesCount(Math.ceil((fullIndex!.length)/elemPerPage));

        if(pagesCount() <= page){
            setPage(0)
        }
        
        setPosts(await engine.blog.getPosts({
            linked_page: linkedPage,
            start: 0 + elemPerPage*page,
            limit: elemPerPage + elemPerPage*page,
            start_date: (Number.isNaN(from)) ? undefined : from,
            end_date: (Number.isNaN(to)) ? undefined : to,
        }));
    }

    createEffect(async () => {
        await initInterface(linkedPage(), page(), elemPerPage(), from(), to())
    })

    onMount(async () => {
        setLinkedPage(navigator.getUrlItem("source"))        
        await initInterface(linkedPage())

        responsive.setMultiUseButtonLabel("Filters")
        responsive.aside = asideRef;
    })
    return(
        <div class="blog page">
            <article>
                <Show when={engine.session.admin}>
                    <div 
                        class="add-post"
                        onClick={() => engine.blog.showCreator()}
                    >
                        +
                    </div>
                </Show>
                <Show when={posts() && posts()!.length >= 1} fallback={<span>Nothing to show</span>}>
                    <For each={posts()}>
                        {(p) => (
                            <BlogPost {...p} />
                        )}
                    </For>
                </Show>
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
                <div class="selector">
                    <h1>Selector</h1>
                    <h2>Topic :</h2>
                    <select
                        name="linkedPage"
                        onChange={(e) => {
                            const value = e.currentTarget.value
                            if(value === "undefined"){
                                setLinkedPage(undefined)
                            } else{
                                setLinkedPage(e.currentTarget.value)
                            }
                        }}
                    >
                        <option value={undefined} selected={(linkedPage() === undefined) ? true : false}>All</option>
                        <option value={"main"} selected={(linkedPage() === "main") ? true : false}>Main</option>
                        <For each={engine.pages.index}>
                            {(p) => (
                                <option value={p.id} selected={(linkedPage() === p.id) ? true : false}>{p.friendly_name}</option>
                            )}
                        </For>
                    </select>
                    <h2>Items per page :</h2>
                    <select
                        name="elemPerPage"
                        onChange={(e) => setElemPerPage(Number(e.currentTarget.value))}
                    >
                        <option value={1}>1</option>
                        <option value={5} selected={true}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                    </select>
                    <h2>From :</h2>
                    <input
                        name="from"
                        type="date"
                        onInput={(e) => setFrom(Number(new Date(e.currentTarget.value))/1000)}
                    />
                    <h2>To :</h2>
                    <input
                        name="to"
                        type="date"
                        onInput={(e) => setTo(Number(new Date(e.currentTarget.value))/1000)}
                    />
                </div>
                <Pagination pageSetter={setPage} page={page()} maxElements={pagesCount()} />
            </aside>
        </div>
    )
}

function BlogPost(p: BlogPostModel){
    const engine = useContext(EngineContext)!
    const [overflowing, setOverflowing] = createSignal<boolean>(false);
    const [focused, setFocused] = createSignal<boolean>(false);
    let mdRef!: HTMLDivElement
    let containerRef!: HTMLDivElement
    let content!: string

    const checkOverflow = () => {
        if (containerRef.clientHeight >= 490){
            setOverflowing(true);
            containerRef.classList.add("overflowing");
        }
    }

    onMount(async () => {
        content = await engine.blog.getPost(p.post_id);
        mdRef.innerHTML = content;
        checkOverflow();
    })

    return(
        <div 
            class="post-container"
            ref={containerRef}
        >
            <div 
                class="post preview"
                onClick={() => setFocused(true)}
            >
                <header>
                    <h1>{p.title}</h1>
                    <span class="date">{utils.formatDate(p.timestamp)}</span>
                    <span class="linked-page">{(p.linked_page !== "main") ? engine.pages.getFriendlyNameFromId(p.linked_page) : p.linked_page}</span>
                </header>
                <div 
                    class="doc"
                    ref={mdRef}
                >

                </div>
                <Show when={overflowing()}>
                    <span class="see-more">Read more...</span>
                </Show>
            </div>
            <Show when={focused()}>
                <BlogPostFullscreen info={p} content={content} setter={setFocused} />
            </Show>
            <Show when={engine.session.admin}>
                <div class="admin-buttons">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            utils.alert(
                                `Delete "${p.title}" ?`,
                                async () => await engine.blog.deletePost(p.post_id)
                            )
                        }}
                    >
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            engine.blog.showCreator(p)                            
                        }}
                    >
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                </div>
            </Show>
        </div>
        
    )
}

function BlogPostFullscreen(props: {info: BlogPostModel, content: string, setter: Setter<boolean>}){
    const engine = useContext(EngineContext)!;

    onMount(() => {
        utils.preventBodyScroll(true);
    })

    onCleanup(() => {
        utils.preventBodyScroll(false);
    })
    return(
        <div 
            class="click-handler"
            onClick={() => props.setter(false)}
        >
            <div 
                class="fs post"
                onClick={(e) => e.stopPropagation()}
            >
                <header>
                    <h1>{props.info.title}</h1>
                    <span class="date">{utils.formatDate(props.info.timestamp)}</span>
                    <span class="linked-page">{(props.info.linked_page !== "main") ? engine.pages.getFriendlyNameFromId(props.info.linked_page) : props.info.linked_page}</span>
                </header>
                <hr />
                <div 
                    class="doc"
                    innerHTML={props.content}
                >

                </div>
            </div>
        </div>
    )
}

export default Blog