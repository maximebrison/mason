import { createSignal, For, onMount, useContext } from "solid-js";
import "./css/repositories.css"
import { ToggleButton } from "../parts/UXElements";
import type { PageInfo } from "../controllers/Models";
import { EngineContext } from "../context/EngineContext";

function Repositories(){
    const engine = useContext(EngineContext)!;
    let fullIndex: PageInfo[];
    const [sort, setSort] = createSignal<"all" | "featured" | "notFeatured" | "shown" | "hidden">("all");
    const [repos, setRepos] = createSignal<PageInfo[]>();

    const filterIndex = (filteredBy: "all" | "featured" | "notFeatured" | "shown" | "hidden" | "featuredAndShown" = "all", provider: string = "all") => {
        let stepOne: PageInfo[] = [];
        fullIndex.forEach((r) => {
            switch(filteredBy){
                case "all":
                    stepOne = fullIndex;
                    break;
                case "featured":
                    (r.featured) ? stepOne.push(r) : null;
                    break;
                case "notFeatured":
                    (!r.featured) ? stepOne.push(r) : null;
                    break;
                case "shown":
                    (r.show) ? stepOne.push(r) : null;
                    break;
                case "hidden":
                    (!r.show) ? stepOne.push(r) : null;
                    break;
                case "featuredAndShown":
                    (r.show && r.featured) ? stepOne.push(r) : null;
                    break;
            }
        })
        let stepTwo: PageInfo[] = []
        stepOne.forEach((r) => {
            if(provider === "all"){
                stepTwo = stepOne;
            } else if(r.provider === provider){
                stepTwo.push(r)
            }
        })
        
        setRepos(stepTwo);
    }

    onMount(async () => {
        fullIndex = await engine.pages.getIndex()
        setRepos(fullIndex)
    })
    return(
        <div class="config-page repositories-settings">
            <h1>Repositories settings</h1>
            <div class="content">
                <div class="sorter">
                    <i>Filter by :</i>
                    <button 
                        class={(sort() === "all") ? "selected" : undefined}
                        onClick={() => {
                            setSort("all")
                            filterIndex("all")
                        }}
                    >
                        All
                    </button>
                    <button 
                        class={(sort() === "shown") ? "selected" : undefined}
                        onClick={() => {
                            setSort("shown")
                            filterIndex("shown")
                        }}
                    >
                        Shown
                    </button>
                    <button 
                        class={(sort() === "hidden") ? "selected" : undefined}
                        onClick={() => {
                            setSort("hidden")
                            filterIndex("hidden")
                        }}
                    >
                        Hidden
                    </button>
                    <button 
                        class={(sort() === "featured") ? "selected" : undefined}
                        onClick={() => {
                            setSort("featured")
                            filterIndex("featured")
                        }}
                    >
                        Featured
                    </button>
                    <button 
                        class={(sort() === "notFeatured") ? "selected" : undefined}
                        onClick={() => {
                            setSort("notFeatured")
                            filterIndex("notFeatured")
                        }}
                    >
                        Not featured
                    </button>
                </div>
                <div class="list">
                    <For each={repos()}>
                        {(repo) => (
                            <Repository {...repo} />
                        )}
                    </For>
                </div>
            </div>
        </div>
    )
}

function Repository(repo: PageInfo){
    const engine = useContext(EngineContext)!
    return(
        <div 
            class="repo burger"
        >
            <div 
                class="title"
                onClick={(e) => {
                    const elem = (e.target.parentElement as HTMLDivElement);
                    let self = false;
                    elem.parentElement!.querySelectorAll(".show").forEach((node) => {
                        (node === elem) ? self = true : null;
                        node.classList.remove("show");
                    })
                    if(!self){
                        elem.classList.add("show");
                    }
                }}
            >
                [{repo.provider}] {repo.full_name}
            </div>
            <div class="dropdown">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        engine.pages.saveIndex(e.currentTarget);
                    }}
                >
                    <div class="entry">
                        <div class="key">Friendly name</div>
                        <div class="value">
                            <input type="text" name="friendly_name" value={repo.friendly_name}/>
                        </div>
                    </div>
                    <div class="entry">
                        <div class="key">Show</div>
                        <div class="value"><ToggleButton isOn={repo.show} inputName="show"/></div>
                    </div>
                    <div class="entry">
                        <div class="key">Featured</div>
                        <div class="value"><ToggleButton isOn={repo.featured} inputName="featured"/></div>
                    </div>
                    <input type="hidden" name="id" value={repo.id}></input>
                    <div class="entry single">
                        <button
                            type="submit"
                            class="validate"
                        >
                            Save config
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Repositories;