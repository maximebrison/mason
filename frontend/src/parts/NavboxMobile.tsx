import './css/navbox.css'
import { responsive } from '../controllers/ResponsiveController';
import { onMount } from 'solid-js';

function NavboxMobile(){
    let navbox!: HTMLDivElement;
    let multiUseButton!: HTMLAnchorElement;

    onMount(() => {
        responsive.multiUseButton = multiUseButton;
    })
    return(
        <div 
            class="navbox mobile"
            ref={navbox}
        >
            <div 
                class='left'
            >
                <a
                    class='item'
                    onClick={() => responsive.toggleNavbox()}
                >
                    <i class="fa-solid fa-bars"></i>
                </a>
            </div>
            <div 
                class='right'
            >
                <a 
                    class='item'
                    onClick={() => responsive.toggleAside()}
                    ref={multiUseButton}
                >
                </a>
            </div>
        </div>
    )
}

export default NavboxMobile