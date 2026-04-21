import './css/banner.css'
import { createSignal, onMount, useContext } from 'solid-js'
import { NavigatorContext } from '../context/NavigatorContext'
import type { BannerBackgroundModel, BannerLogoModel } from '../controllers/Models'
import { FunController } from '../controllers/FunController'
import { EngineContext } from '../context/EngineContext'

function Banner(){
    const engine = useContext(EngineContext)!;
    const navigator = useContext(NavigatorContext)!
    const [logo, setLogo] = createSignal<BannerLogoModel|undefined>(undefined);
    const [bannerBg, setBannerBg] = createSignal<BannerBackgroundModel|undefined>(undefined);
    const controller = engine.assets;
    let bannerRef!: HTMLDivElement;
    let canvasRef!: HTMLCanvasElement;

    const styleBackground = (background: BannerBackgroundModel|undefined) => {
        if(background && background.show){
            const style = `
                background-image: url(${background.src});
                background-size: ${background.background_size};
                background-position: ${background.background_position};
                background-repeat: ${(background.background_repeat) ? "repeat" : "no-repeat"};
            `
            return style;
        }
        return ""
    }

    const styleLogo = (logo: BannerLogoModel|undefined) => {
        if(logo && logo.show){
            const style = `
                border-radius: ${logo.border_radius};
            `
            return style;
        }
        return "display: none;"
    }

    onMount(() => {
        controller.getPaths().then(() => {
            setLogo(controller.paths.banner_logo)
            setBannerBg(controller.paths.banner_bg)
            const fun = new FunController(canvasRef)
            switch(bannerBg()!.background_type){
                case "gol":
                    fun.gameOfLife();
                    break;
                default:
                    break;
            }
        })
    })

    return(
        <div 
            class="banner"
            ref={bannerRef}
            style={styleBackground(bannerBg())}
        >
            <a 
                class='logo'
                href='/'
                onClick={(e) => {
                    e.preventDefault()
                    navigator.go("home")
                }}
            >
                <img 
                    src={(logo()) ? logo()!.src : ""}
                    style={styleLogo(logo())}
                />
            </a>
            <canvas ref={canvasRef}></canvas>
        </div>
    )
}

export default Banner