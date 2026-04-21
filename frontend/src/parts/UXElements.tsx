import { createEffect, createSignal, For, onCleanup, onMount, Show, type JSXElement, type Setter } from 'solid-js';
import './css/uxelements.css'
import logo from "../assets/loading.gif"

type ToggleButtonProps= {
    isOn: boolean
    action?: Function
    inputName?: string
    label?: string
    bitImages?: {
        on: string,
        off: string
    }
}

function ToggleButton(props: ToggleButtonProps){
    const [on, setOn] = createSignal(props.isOn);

    return(
        <div 
            class='toggle-button'
            onClick={() => {
                setOn(!on());
                if(props.action){
                    props.action()
                }
            }}
        >
            <Show when={props.label}>
                <span class='label'>{props.label}</span>
            </Show>
            <div 
                class='toggle-wrapper'
            >
                <div 
                    class='toggle-box'
                    classList={{on: on()}}
                >
                    <div 
                        class='toggle-bit'
                    >
                        <Show when={props.inputName}>
                            <input type='hidden' name={props.inputName} value={String(on())} />
                        </Show>
                        <Show when={props.bitImages}>
                            <img src={(on()) ? props.bitImages!.on: props.bitImages!.off} />
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    )
}

export type NotifModel = {
    success: boolean
    msg: string
}

function Notification(props: {setter: Setter<NotifModel|null>, success: boolean, msg: string}){
    let timeoutId!: number

    onMount(() => {
        timeoutId = setTimeout(() => props.setter(null), 5000);
    })

    onCleanup(() => {
        clearTimeout(timeoutId);
    })
    return(
        <div class={`notification ${(!props.success) ? "error": ""}`}>
            {props.msg}
        </div>
    )
}

function Spinner(props: {msg?: string}){
    const [gif, setGif] = createSignal<string|undefined>(undefined)

    onMount(() => {
        setGif(`${logo}?${Date.now()}`);
    })

    onCleanup(() => {
        setGif(undefined)
    })
    return(
        <div 
            class="loading"
            onClick={(e) => e.stopPropagation()}
        >
            <span class='spin'><img src={gif()} width={"150px"}></img></span>
            <span>{props.msg ? props.msg : "Loading..."}</span>
        </div>
    )
}

export type AlertModel = {
    msg: string,
    fn: Function,
    refresh: boolean
}

function Alert(props: {setter: Setter<AlertModel|null>, msg: string, fn: Function, refresh: boolean}){
    return(
        <div class='alert'>
            <p>{props.msg}</p>
            <div class='buttons'>
                <button 
                    class='sensible'
                    onClick={() => props.setter(null)}
                >
                    Cancel
                </button>
                <button 
                    class='validate'
                    onClick={async () => {
                        await Promise.resolve(props.fn())
                        props.setter(null)
                        if(props.refresh){
                            window.location.reload()
                        }
                    }}
                >
                    Proceed
                </button>
            </div>
        </div>
    )
}

function Pagination(props: {pageSetter: Setter<number>, page: number, maxElements: number}){
    let buttonsContainer!: HTMLDivElement
    let lastPage = 0

    createEffect(() => {
        let options: ScrollToOptions = {}
        
        if(lastPage < props.page){
            options = {
                behavior: "smooth",
                left: 25
            }
        }
        if(lastPage > props.page){
            options = {
                behavior: "smooth",
                left: -25
            }
        }
        buttonsContainer.scrollBy(options)

        lastPage = props.page
    })
    return(
        <div class='pagination'>
            <button
                onClick={() => {
                    if(props.page !== 0){
                        props.pageSetter((prev) => prev - 1)
                    }
                }}
            >
                {"<"}
            </button>
            <div 
                class='pagination-buttons'
                ref={buttonsContainer}    
            >
                <For each={new Array(props.maxElements)}>
                    {(_, i) => (
                        <button 
                            onClick={() => props.pageSetter(i())}
                            class={(props.page === i()) ? "selected" : ""}
                        >
                            {i()+1}
                        </button>
                    )}
                </For>
            </div>
            <button
                onClick={() => {
                    if(props.page < props.maxElements - 1){
                        props.pageSetter((prev) => prev + 1)
                    }
                }}
            >
                {">"}
            </button>
        </div>
    )
}

/**
 * Not used yet, work in progress...
 * @param props 
 * @returns 
 */
function Dropdown(props: {children: JSXElement}){
    const [innerHTML, setInnerHTML] = createSignal(false)
    let ref!: HTMLDivElement
    return(
        <div 
            class='dropdown-wrapper'
            ref={ref}
            onClick={() => {
                setInnerHTML((prev) => !prev)
            }}
        >
            {(innerHTML()) ? props.children : "Click me !"}
        </div>
    )
}

function PopupInfoBox(props: {setter: Setter<JSXElement|null>, children: JSXElement}){
    return(
        <div 
            class='click-handler'
            onClick={() => props.setter(null)}    
        >
            <div 
                class='popup'
                onClick={(e) => e.stopPropagation()}
            >
                {props.children}
            </div>
        </div>
    )
}

export {ToggleButton, Notification, Spinner, Alert, Dropdown, Pagination, PopupInfoBox};