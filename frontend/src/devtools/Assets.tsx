import { AssetsController } from "../controllers/AssetsController"
import { createSignal, onMount, Show } from "solid-js";
import { Spinner, ToggleButton } from "../parts/UXElements";
import type { AssetsPaths } from "../controllers/Models";

function AssetsManager(){
    let controller = new AssetsController()

    const [loaded, setLoaded] = createSignal<boolean>(false);
    const [spin, setSpin] = createSignal<boolean>(false);
    const [assets, setAssets] = createSignal<AssetsPaths|null>(null);

    onMount(() => {
        setSpin(true)
        controller.getPaths().then(() => {
            setAssets(controller.paths)
            setLoaded(true)
            setSpin(false)
        })
    })

    return(
        <Show when={loaded()}>
            <div class="config-page assets">
                <h1>Assets manager</h1>
                <div class="content">
                    <h2>Site icon</h2>
                    <form
                        name="site_icon"
                        onSubmit={(e) => {
                            e.preventDefault()
                            controller.upload2(e.currentTarget)
                        }}
                    >
                        <div class="entry">
                            <span class="key">File</span>
                            <span class="value"><input name="file" type="file" accept=".svg, .png, .jpg, .jpeg"></input></span>
                        </div>
                        <div class="entry single">
                            <button type="submit" class="validate">Save</button>
                        </div>
                    </form>
                    <h2>Banner logo</h2>
                    <form
                        name="banner_logo"
                        onSubmit={(e) => {
                            e.preventDefault()
                            controller.upload2(e.currentTarget)
                        }}
                    >
                        <div class="entry">
                            <span class="key">File</span>
                            <span class="value"><input name="file" type="file" accept=".svg, .png, .jpg, .jpeg"></input></span>
                        </div>
                        <div class="entry">
                            <span class="key">Show</span>
                            <span class="value">
                                <ToggleButton isOn={assets()!.banner_logo.show} inputName="show"/>
                            </span>
                        </div>
                        <div class="entry">
                            <span class="key">border-radius</span>
                            <span class="value"><input name="border_radius" value={assets()!.banner_logo.border_radius} type="text"></input></span>
                        </div>
                        <div class="entry single">
                            <button type="submit" class="validate">Save</button>
                        </div>
                    </form>
                    <h2>Banner background</h2>
                    <form
                        name="banner_bg"
                        onSubmit={(e) => {
                            e.preventDefault()
                            controller.upload2(e.currentTarget)
                        }}
                    >
                        <div class="entry">
                            <span class="key">Type</span>
                            <span class="value">
                                <select name="background_type" value={assets()!.banner_bg.background_type}>
                                    <option value="image">Image</option>
                                    <option value="gol">Game of life</option>
                                </select>
                            </span>
                        </div>
                        <div class="entry">
                            <span class="key">File</span>
                            <span class="value"><input name="file" type="file" accept=".svg, .png, .jpg, .jpeg"></input></span>
                        </div>
                        <div class="entry">
                            <span class="key">Show</span>
                            <span class="value">
                                <ToggleButton isOn={assets()!.banner_bg.show} inputName="show" />
                            </span>
                        </div>
                        <div class="entry">
                            <span class="key">background-size</span>
                            <span class="value"><input name="background_size" value={assets()!.banner_bg.background_size} type="text"></input></span>
                        </div>
                        <div class="entry">
                            <span class="key">background-position</span>
                            <span class="value"><input name="background_position" value={assets()!.banner_bg.background_position} type="text"></input></span>
                        </div>
                        <div class="entry">
                            <span class="key">background-repeat</span>
                            <span class="value">
                                <ToggleButton isOn={assets()!.banner_bg.background_repeat} inputName="background_repeat"/>
                            </span>
                        </div>
                        <div class="entry single">
                            <button type="submit" class="validate">Save</button>
                        </div>
                    </form>
                    <h2>Footer background</h2>
                    <form
                        name="footer_bg"
                        onSubmit={(e) => {
                            e.preventDefault()
                            controller.upload2(e.currentTarget)
                        }}
                    >
                        <div class="entry">
                            <span class="key">File</span>
                            <span class="value"><input name="file" type="file" accept=".svg, .png, .jpg, .jpeg"></input></span>
                        </div>
                        <div class="entry">
                            <span class="key">Show</span>
                            <span class="value">
                                <ToggleButton isOn={assets()!.footer_bg.show} inputName="show"/>
                            </span>
                        </div>
                        <div class="entry">
                            <span class="key">background-size</span>
                            <span class="value"><input name="background_size" value={assets()!.footer_bg.background_size} type="text"></input></span>
                        </div>
                        <div class="entry">
                            <span class="key">background-position</span>
                            <span class="value"><input name="background_position" value={assets()!.footer_bg.background_position} type="text"></input></span>
                        </div>
                        <div class="entry">
                            <span class="key">background-repeat</span>
                            <span class="value">
                                <ToggleButton isOn={assets()!.footer_bg.background_repeat} inputName="background_repeat"/>
                            </span>
                        </div>
                        <div class="entry single">
                            <button type="submit" class="validate">Save</button>
                        </div>
                    </form>
                </div>
                <div class="bottom">
                    
                </div>
                <Show when={spin()}>
                    <Spinner />
                </Show>
            </div>
        </Show>
    )
}

export default AssetsManager