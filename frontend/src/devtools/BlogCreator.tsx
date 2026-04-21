import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css"
import "@milkdown/crepe/theme/nord-dark.css"
import { createSignal, For, onCleanup, onMount, useContext } from "solid-js";
import { utils } from "../controllers/Utilities";
import { EngineContext } from "../context/EngineContext";
import type { BlogPostModel } from "../controllers/Models";

export type BlogCreatorProps = {
    content?: BlogPostModel
}

function BlogCreator(props: BlogCreatorProps){
    const engine = useContext(EngineContext)!;
    let editorRef!: HTMLDivElement;
    let formRef!: HTMLFormElement;
    let editor!: Crepe;
    const [isDirty, setIsDirty] = createSignal<boolean>(false);

    const warn = (e: BeforeUnloadEvent) => {
        e.preventDefault()
    }

    const beforeQuit = () => {
        if(isDirty()){
            utils.alert(
                "Content not saved, exit ?",
                () => engine.blog.hideCreator()
            )
        } else{
            engine.blog.hideCreator()
        }
    }

    const normalize = (md: string) => {
        return md.replace(/^([*\-+] .+)\n\n(?=[*\-+] )/gm, '$1\n')
    }

    const post = async () => {
        const formData = new FormData(formRef);

        formData.append("content", normalize(editor.getMarkdown()));
        if(formData.get("title")?.toString().length === 0){
            formData.set("title", engine.blog.generateTitle())
        }

        if(props.content === undefined){
            const res = await engine.blog.post(formData);

            if(res){
                engine.blog.hideCreator()
            }
        } else{
            formData.append("post_id", props.content.post_id)
            const res = await engine.blog.update(formData);

            if(res){
                engine.blog.hideCreator()
            }
        }
    }

    onMount(async() => {
        engine.preventBodyScroll(true);

        let defaultValue = "";

        if(props.content !== undefined){
           defaultValue = await engine.blog.getMarkdown(props.content.post_id);
        }

        editor = new Crepe({
            root: editorRef,
            defaultValue: defaultValue,
            featureConfigs: {
                [Crepe.Feature.ImageBlock]: {
                    onUpload: async (file) => {
                        return await engine.blog.uploadImage(file)
                    }
                }
            }
        })
        editor.on((ctx) => {
            ctx.markdownUpdated((_, md, prevMd) => {
                if(md.trim() !== prevMd.trim()){
                    setIsDirty(true) 
                }
            })
        })

        editor.create();

        window.addEventListener("beforeunload", warn);
    })

    onCleanup(() => {
        engine.preventBodyScroll(false);
        editor.destroy();
        
        window.removeEventListener("beforeunload", warn);
    })
    return(
        <div 
            class="click-handler"
            onClick={() => {
                beforeQuit();
            }}
        >
            <div 
                class="blog-creator"
                onClick={(e) => e.stopPropagation()}
            >
                <header>
                    <form 
                        ref={formRef}
                        onSubmit={(e) => {
                            e.preventDefault()
                        }}
                    >
                        <label>Title:</label>
                        <input type="text" name="title" value={(props.content !== undefined) ? props.content.title : ""}></input>
                        <label>Linked page :</label>
                        <select name="linked_page">
                            <option value="main" selected={(props.content?.linked_page === "main") ? true : false}>main</option>
                            <For each={engine.pages.index}>
                                {(p) => (
                                    <option value={p.id} selected={(props.content?.linked_page === p.id) ? true : false}>{p.friendly_name}</option>
                                )}
                            </For>
                        </select>
                    </form>
                </header>
                <article
                    ref={editorRef}
                />
                <footer>
                    <button 
                        class="validate" 
                        onClick={() => utils.alert(
                            "Are you sure you want to proceed ?",
                            async () => {
                                window.removeEventListener("beforeunload", warn);
                                await post()
                            }
                        )}
                    >
                        Submit
                    </button>
                </footer>
            </div>
        </div>
    )
}

export default BlogCreator;