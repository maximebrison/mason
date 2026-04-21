import { createSignal, For, Match, onCleanup, onMount, Show, Switch, type Setter } from "solid-js";
import "./css/config-flow.css"
import logo from "../assets/logo.svg"
import { ConfigController } from "../controllers/ConfigController";
import type { APIKeyModel } from "../controllers/Models";
import { api } from "../controllers/APIController";
import { utils } from "../controllers/Utilities";
import { Spinner } from "../parts/UXElements";

function ConfigFlow(){
    const [step, setStep] = createSignal<number>(0);
    const controller = new ConfigController();

    const removeListener = () => {
        window.removeEventListener("beforeunload", warn);
    }

    const warn = (e: BeforeUnloadEvent) => {
        e.preventDefault()
    }

    onMount(() => {
        window.addEventListener("beforeunload", warn);
    })

    onCleanup(() => {
        window.removeEventListener("beforeunload", warn);
    })

    return(
        <div class="config-flow">
            <div class="container">
                <Switch fallback={<Spinner />}>
                    <Match when={step() === 0}>
                        <WelcomeStep controller={controller} setter={setStep}/>
                    </Match>
                    <Match when={step() === 1}>
                        <ApiKeysStep controller={controller} setter={setStep}/>
                    </Match>
                    <Match when={step() === 2}>
                        <SignupStep controller={controller} setter={setStep} removeListener={removeListener}/>
                    </Match>
                </Switch>
            </div>
        </div>
    )
}

function WelcomeStep(props: {controller: ConfigController, setter: Setter<number>}){
    let setupKeyRef!: HTMLInputElement;

    return(
        <div class="welcome step">
            <h1>Welcome to Mason !</h1>
            <img src={logo} />
            <div class="body">
                <h2>Enter your <b>CONFIG_KEY</b></h2>
                <input type="text" ref={setupKeyRef}></input>
                <blockquote>
                    You'll find it in the container's logs
                    <pre>docker logs {'<container-name>'} | grep "CONFIG_KEY"</pre>
                </blockquote>
                <button
                    onClick={() => {
                        props.controller.checkKey(setupKeyRef.value).then((ok) => {
                            if(ok){
                                props.setter(1);
                            } else{
                                api.notif({"success": false, "msg": "Wrong key"});
                            }
                        })
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    )
}

function ApiKeysStep(props: {controller: ConfigController, setter: Setter<number>}){
    const [keys, setKeys] = createSignal<[APIKeyModel] | []>([]);
    const [availableProviders, setAvailableProviders] = createSignal<[string]|[]>([]);

    onMount(() => {
        props.controller.apiKeys.getKeys().then((data) => {
            setKeys(data);
        })

        props.controller.apiKeys.getAvailableProviders().then((data) => {
            setAvailableProviders(data);
        })
    })
    return(
        <div class="api-keys step">
            <header>
                <h1>Setup API keys</h1>
                <blockquote>
                    The primary key (in yellow) is the one that decides which provider to use for fetching homepage and right-navbar items.<br/>
                    It's based on your main repo :
                    <pre>{"https://provider.com/{username}/{username}"}</pre>
                </blockquote>
            </header>
            <div class="body">
                <div class="added-keys">
                    <For each={keys()}>
                        {(k) => (
                            <div class="loaded-key">
                                <span class={`key ${(k.is_primary) ? "primary" : ""}`}>{k.provider}/{k.username}</span>
                                <Show when={!k.is_primary}>
                                    <span
                                        title="Make primary"
                                        class="inline-button"
                                        onClick={async () => {
                                            utils.spin();
                                            const success = await props.controller.apiKeys.makePrimary(k.id);
                                            if(success){
                                                setKeys(await props.controller.apiKeys.getKeys())
                                            }
                                            utils.stopSpin();
                                        }}
                                    >
                                        <i class="fa-regular fa-star"></i>
                                    </span>
                                </Show>
                                <span
                                    title="Delete key"
                                    class="inline-button"
                                    onClick={async () => {
                                        utils.spin();
                                        const success = await props.controller.apiKeys.popKey(k.id);
                                        if(success){
                                            setKeys(await props.controller.apiKeys.getKeys());
                                        }
                                        utils.stopSpin();
                                    }}
                                >
                                    <i class="fa-solid fa-trash-can"></i>
                                </span>
                            </div>
                        )}
                    </For>
                </div>
                <div class="add">
                    <form
                    onSubmit={async (e) => {
                        utils.spin()
                        e.preventDefault();
                        const success = await props.controller.apiKeys.insertKey(e.currentTarget);
                        if(success){
                            setKeys(await props.controller.apiKeys.getKeys())
                        }
                        utils.stopSpin()
                    }}
                    >
                        <select
                            name="provider"
                        >
                            <For each={availableProviders()}>
                                {(p) => (
                                    <option value={p}>{p}</option>
                                )}
                            </For>
                        </select>
                        <input type="text" name="key" placeholder="API_KEY"></input>
                        <button
                            type="submit"
                            class="inline"
                        >
                            +
                        </button>
                    </form>
                </div>
                <Show when={keys().length > 0}>
                    <button
                        onClick={() => props.setter((prev) => prev + 1)}
                    >
                        Next
                    </button>
                </Show>
            </div>
        </div>
    )
}

function SignupStep(props: {controller: ConfigController, setter: Setter<number>, removeListener: Function}){
    const checkInputs = (form: HTMLFormElement) => {
        let success = true;
        const formData = new FormData(form);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const retype_password = formData.get("retype_password") as string;

        if(username.length < 3){
            api.notif({success: false, msg: "Username should be at least 3 characters long"});
            success = false;
        }
        if(password.length < 8){
            api.notif({success: false, msg: "Password should be at least 8 characters long"});
            success = false;
        }
        if(password !== retype_password){
            api.notif({success: false, msg: "Passwords do not match"});
            success = false;
        }
        
        return success
    }
    return(
        <div class="signup step">
            <header>
                <h1>Create admin login</h1>
                <blockquote>
                    <p>Create your username and password to access Admin Panel</p>
                </blockquote>
            </header>
            <div class="body">
                <form 
                    onSubmit={async (e) => {
                        e.preventDefault()
                        const form = e.currentTarget;
                        if(checkInputs(form)){
                            utils.spin("Loading... This usually takes less than 30 seconds...");
                            const userCreated = await props.controller.signup.createUser(form)

                            if(userCreated){
                                const success = await props.controller.signup.firstLogin(form);
                                    if(success){
                                        props.removeListener()
                                        window.location.reload()
                                    } else{
                                        utils.stopSpin()
                                    }
                            } else{
                                utils.stopSpin()
                            }
                        }
                    }}
                >
                    <label>Username :</label>
                    <input type="text" name="username" autocomplete="new-username"></input>
                    <label>Password :</label>
                    <input type="password" name="password" autocomplete="new-password"></input>
                    <label>Retype password :</label>
                    <input type="password" name="retype_password" autocomplete="new-password"></input>
                    <button type="submit">Sign up</button>
                </form>
            </div>
        </div>
    )
}

export default ConfigFlow;