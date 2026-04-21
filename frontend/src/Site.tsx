import Banner from "./parts/Banner"
import Navbox from "./parts/Navbox"
import Homepage from "./pages/Homepage"
import "./css/site.css"
import "./css/animations.css"
import "./css/highlight.css"
import { createSignal, Match, Switch, Show, For, useContext, onMount, createEffect } from "solid-js"
import Notfound from "./pages/Notfound"
import Devtools from "./devtools/Devtools"
import Page from "./pages/Page"
import NavbarPage from "./pages/NavbarPage"
import { AssetsController } from "./controllers/AssetsController"
import Footer from "./parts/Footer"
import { Spinner } from "./parts/UXElements"
import type { PageInfo } from "./controllers/Models"
import { EngineContext } from "./context/EngineContext"
import { NavigatorContext } from "./context/NavigatorContext"
import Login from "./pages/Login"
import Blog from "./pages/Blog"
import Signup from "./pages/Signup"
import NavboxMobile from "./parts/NavboxMobile"

function Site() {
    const engine = useContext(EngineContext)!
    const navigator = useContext(NavigatorContext)!

    const [loaded, setLoaded] = createSignal<boolean>(false);
    const [page, setPage] = createSignal<string>("home");
    const [pages, setPages] = createSignal<PageInfo[]>([]);
    const [navbarPages, setNavbarPages] = createSignal<string[]>([])
    const [admin, setAdmin] = createSignal<string|undefined>(undefined);

    let contentRef!: HTMLDivElement;

    createEffect(() => {
        if(loaded()){
            const current = page()

            engine.branding.title.innerText = `${engine.pages.getFriendlyNameFromId(current)} | ${engine.branding.branding.title}`
        }
    })

    onMount(() => {
        navigator.loadSetPage(setPage);
        navigator.go(navigator.getPage());
        engine.run().then(() => {
            setPages(engine.pages.index);
            setNavbarPages(engine.pages.navbarPages!);
            setAdmin(engine.session.admin)
            setLoaded(true);
        });
        const assetsController = new AssetsController();
        assetsController.loadSiteIcon();
    })
    return (
        <div class="site">
            <Show when={loaded()} fallback={<Spinner msg="Loading engine..."/>}>
                <header>
                    <Banner />
                </header>
                <Navbox currentPage={page()} />
                <NavboxMobile />
                <div 
                    class="content"
                    ref={contentRef}
                >
                    <Switch fallback={<Notfound />}>
                        <Match when={page() === "home"}>
                            <Homepage />
                        </Match>
                        <Match when={page() === "blog"}>
                            <Blog />
                        </Match>
                        <Match when={page() === "_login"}>
                            <Login />
                        </Match>
                        <Match when={page() === "_signup"}>
                            <Signup />
                        </Match>
                        <For each={pages()}>
                        {(i) => (
                            <Match when={page() === i.id}>
                                <Page {...i}/>
                            </Match>
                        )}
                        </For>
                        <For each={navbarPages()}>
                        {(i) => (
                            <Match when={page().toLowerCase() === i.toLowerCase()}>
                                <NavbarPage dir={i}/>
                            </Match>
                        )}
                        </For>
                    </Switch>
                </div>
                <Show when={admin()}>
                    <Devtools />
                </Show>
                <Footer />
            </Show>
        </div>
  )
}

export default Site
