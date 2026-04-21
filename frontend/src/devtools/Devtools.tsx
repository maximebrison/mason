import { createSignal, Match, onMount, Show, Switch, useContext } from "solid-js";
import "./css/devtools.css"
import Config from "./Config";
import Repositories from "./Repositories";
import Logs from "./Logs";
import Colors from "./Colors";
import AssetsManager from "./Assets";
import ApiKeys from "./ApiKeys";
import { EngineContext } from "../context/EngineContext";
import { NavigatorContext } from "../context/NavigatorContext";
import Branding from "./Branding";
import BlogCreator, { type BlogCreatorProps } from "./BlogCreator";
import Users from "./Users";

function Devtools(){
    const [showModal, setShowModal] = createSignal<boolean>(false);
    const [showBlogCreator, setShowBlogCreator] = createSignal<BlogCreatorProps|null>(null);
    const [subpage, setSubpage] = createSignal("config");
    const engine = useContext(EngineContext)!;
    const navigator = useContext(NavigatorContext)!;

    onMount(() => {
        engine.blog.loadSetter(setShowBlogCreator);
    })

    return(
        <div>
            <div class="admin-tools">
                <button 
                    title="Settings"
                    onClick={() => {
                        setShowModal(true);
                        engine.preventBodyScroll(true);
                    }}
                >
                    <i class="fa-solid fa-wrench"></i>
                </button>
                <button 
                    title="Logout"
                    class="logout"
                    onClick={() => {
                        engine.session.logout().then((data) => {
                            if (data.success) {
                                navigator.go("home");
                                window.location.reload();
                            }
                        })
                    }}
                >
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
            </div>
            <Show when={showBlogCreator()}>
                <BlogCreator {...showBlogCreator()}/>
            </Show>
            <Show when={showModal()}>
                <div 
                    class="modal"
                    onclick={() => {
                        setShowModal(false)
                        engine.preventBodyScroll(false);
                    }}
                >
                    <div 
                    class="modal-content"
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div class="devtools">
                            <div class="left">
                                <div class="category">
                                    <h2>Server settings</h2>
                                    <span
                                        onClick={() => setSubpage("config")}
                                        class={(subpage() === "config") ? "selected": undefined}
                                    >
                                        <i class="fa-solid fa-gear"></i>General configuration
                                    </span>
                                    <span
                                        onClick={() => setSubpage("repos")}
                                        class={(subpage() === "repos") ? "selected": undefined}
                                    >
                                        <i class="fa-solid fa-book-bookmark"></i>Repositories settings
                                    </span>
                                    <span
                                        onClick={() => setSubpage("keys")}
                                        class={(subpage() === "keys") ? "selected": undefined}
                                    >
                                        <i class="fa-solid fa-key"></i>API Keys
                                    </span>
                                    <span
                                        onClick={() => setSubpage("users")}
                                        class={(subpage() === "users") ? "selected": undefined}
                                    >
                                        <i class="fa-solid fa-users"></i>Users
                                    </span>
                                </div>
                                <hr />
                                <div class="category">
                                    <h2>UI settings</h2>
                                    <span
                                        onClick={() => setSubpage("assets")}
                                        class={(subpage() === "assets") ? "selected": undefined}
                                    >
                                        <i class="fa-solid fa-image"></i>Assets
                                    </span>
                                    <span
                                        onClick={() => setSubpage("colors")}
                                        class={(subpage() === "colors") ? "selected": undefined}
                                    >
                                        <i class="fa-solid fa-palette"></i>Colors editor
                                    </span>
                                    <span
                                        onClick={() => setSubpage("branding")}
                                        class={(subpage() === "branding") ? "selected": undefined}
                                    >
                                        <i class="fa-solid fa-font-awesome"></i>Branding
                                    </span>
                                </div>
                                <hr />
                                <div class="category">
                                    <h2>Misc</h2>
                                    <span
                                        onClick={() => setSubpage("logs")}
                                        class={(subpage() === "logs") ? "selected": undefined}
                                    >
                                        <i class="fa-solid fa-file-lines"></i>Logs
                                    </span>
                                </div>
                            </div>
                            <hr />
                            <div class="right">
                                <Switch fallback={<Config />}>
                                    <Match when={subpage() === "config"}>
                                        <Config />
                                    </Match>
                                    <Match when={subpage() === "repos"}>
                                        <Repositories />
                                    </Match>
                                    <Match when={subpage() === "logs"}>
                                        <Logs />
                                    </Match>
                                    <Match when={subpage() === "colors"}>
                                        <Colors />
                                    </Match>
                                    <Match when={subpage() === "assets"}>
                                        <AssetsManager />
                                    </Match>
                                    <Match when={subpage() === "keys"}>
                                        <ApiKeys />
                                    </Match>
                                    <Match when={subpage() === "branding"}>
                                        <Branding />
                                    </Match>
                                    <Match when={subpage() === "users"}>
                                        <Users />
                                    </Match>
                                </Switch>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    )
}

export default Devtools;