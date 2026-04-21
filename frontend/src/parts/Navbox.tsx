import { EngineContext } from '../context/EngineContext';
import { NavigatorContext } from '../context/NavigatorContext';
import { ThemeContext } from '../context/ThemeContext';
import './css/navbox.css'
import { createSignal, For, onMount, useContext } from 'solid-js'
import { ToggleButton } from './UXElements';
import moon from '../assets/moon.svg'
import sun from '../assets/sun.svg'
import { responsive } from '../controllers/ResponsiveController';

function Navbox(props: {currentPage: string}){
    const engine = useContext(EngineContext)!;
    const navigator = useContext(NavigatorContext)!;
    const theme = useContext(ThemeContext)!;
    const [right, setRight] = createSignal<string[]>([]);
    const left = engine.pages.index;
    let navbox!: HTMLDivElement;

    onMount(() => {
        responsive.navbox = navbox;
        engine.pages.getNavbar().then(() => {
            setRight(engine.pages.navbarPages!)
        })
    })
    return(
        <div 
            class="navbox desktop"
            ref={navbox}
        >
            <div 
                class='left'
            >
                <a
                    class={(props.currentPage === "home") ? "item selected" : "item"}
                    href='/'
                    onclick={(e) => {
                        e.preventDefault()
                        navigator.go("home")
                    }}
                >
                    <i class="fa-solid fa-house"></i>
                </a>
                <a
                    class={(props.currentPage === "blog") ? "item selected" : "item"}
                    href='/?page=blog'
                    onclick={(e) => {
                        e.preventDefault()
                        navigator.go("blog")
                    }}
                >
                    Blog
                </a>
                <For each={left}>
                    {(page) => (
                        <a
                            class={(props.currentPage === page.id) ? "item selected" : "item"}
                            href={`/?page=${page.id}`}
                            onclick={(e) => {
                                e.preventDefault()
                                navigator.go(page.id)
                            }}
                        >
                            {page.friendly_name}
                        </a>
                    )}
                </For>
            </div>
            <hr />
            <div 
                class='right'
            >
                <ToggleButton isOn={theme.dark} action={() => theme.switchTheme()} bitImages={{on: moon, off: sun}}/>
                <For each={right()}>
                    {(page) => (
                        <a
                            class={(props.currentPage === page) ? "item selected" : "item"}
                            href={`/?page=${page.toLowerCase()}`}
                            onclick={(e) => {
                                e.preventDefault()
                                navigator.go(page)
                            }}
                        >
                            {page}
                        </a>
                    )}
                </For>
            </div>
            <button 
                class='close'
                onClick={() => responsive.toggleNavbox()}
            >
                <i class="fa-solid fa-x"></i>
            </button>
        </div>
    )
}

export default Navbox