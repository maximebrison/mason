import { createSignal, Match, onMount, Show, Switch, type JSXElement } from "solid-js";
import Site from "./Site";
import { Alert, type AlertModel, Notification, Spinner, type NotifModel, PopupInfoBox } from "./parts/UXElements";
import ConfigFlow from "./devtools/ConfigFlow";
import { EngineProvider } from "./context/EngineContext";
import { NavigatorProvider } from "./context/NavigatorContext";
import { ThemeProvider } from "./context/ThemeContext";
import { api } from "./controllers/APIController";
import { utils } from "./controllers/Utilities";

function App(){
    const [loaded, setLoaded] = createSignal<boolean>(false);
    const [needsSetup, setNeedsSetup] = createSignal<boolean>(false);
    const [notif, setNotif] = createSignal<NotifModel|null>(null);
    const [alert, setAlert] = createSignal<AlertModel|null>(null);
    const [popup, setPopup] = createSignal<JSXElement|null>(null);
    const [spin, setSpin] = createSignal<string|null>(null);

    onMount(async () => {
        utils.loadSetAlert(setAlert);
        utils.loadSetPopup(setPopup);
        utils.loadSetSpin(setSpin);
        api.init(setNotif)
        api.request("/api/public/utils/needs_setup").then((data) => {
            setNeedsSetup(data);
            setLoaded(true);
        })
    })
    return(
        <ThemeProvider>
            <Show when={loaded()} fallback={<Spinner />}>
                <Switch fallback={<Spinner msg="Site under maintenance" />}>
                    <Match when={!needsSetup()}>
                        <EngineProvider>
                            <NavigatorProvider>
                                <Site />
                            </NavigatorProvider>
                        </EngineProvider>
                    </Match>
                    <Match when={needsSetup()}>
                        <ConfigFlow />
                    </Match>
                </Switch>
            </Show>
            <Show when={notif()}>
                <Notification setter={setNotif} {...notif()!} />
            </Show>
            <Show when={alert()}>
                <Alert setter={setAlert} {...alert()!} />
            </Show>
            <Show when={spin()}>
                <Spinner msg={spin()!}/>
            </Show>
            <Show when={popup()}>
                <PopupInfoBox setter={setPopup}>
                    {popup()!}
                </PopupInfoBox>
            </Show>
        </ThemeProvider>
    )
}

export default App;