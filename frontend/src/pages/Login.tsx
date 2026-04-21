import { onMount, useContext } from "solid-js";
import "./css/login.css"
import { NavigatorContext } from "../context/NavigatorContext";
import { EngineContext } from "../context/EngineContext";
import { api } from "../controllers/APIController";

function Login(){
    const engine = useContext(EngineContext)!;
    const navigator = useContext(NavigatorContext)!;

    onMount(() => {
        if(engine.session.admin){
            navigator.go("home")
            api.notif({success: false, msg: "Already logged-in"})
        }
    })

    return(
        <div class="login">
            <h1>Webmaster login</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    engine.session.login(e.currentTarget).then((data) => {
                        if (data.success){
                            navigator.go("home");
                            window.location.reload();
                        }
                    })
                }}
            >
                <label>Username :
                    <input type="text" name="username" autocomplete="username"></input>
                </label>
                <label>Password :
                    <input type="password" name="password" autocomplete="password"></input>
                </label>
                <button type="submit" class="validate">Login</button>
            </form>
        </div>
    )
}

export default Login;