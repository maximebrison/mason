import { createSignal, onMount, useContext } from "solid-js";
import { api } from "../controllers/APIController";
import { EngineContext } from "../context/EngineContext";
import { NavigatorContext } from "../context/NavigatorContext";

function Signup(){
    const engine = useContext(EngineContext)!;
    const navigator = useContext(NavigatorContext)!;
    const [token, setToken] = createSignal("")

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

    onMount(async () => {
        const url = new URLSearchParams(document.location.search)
        const t = url.get("token")
        if(t && await engine.session.validateSignupToken(t)){
            if(engine.session.admin){
                navigator.go("home", undefined, undefined, true)
                api.notif({
                    success: false,
                    msg: "Please log out before creating an account"
                })
            } else{
                setToken(t);
            }
        } else{
            navigator.go("home", undefined, undefined, true)
            api.notif({
                success: false,
                msg: "Token expired or invalid"
            })
        }
    })
    return(
        <div class="login">
            <h1>Create your account</h1>
            <form 
                onSubmit={async (e) => {
                    e.preventDefault()
                    const form = e.currentTarget;
                    if(checkInputs(form)){
                        const res = await engine.session.signup(form);

                        if(res){
                            const res = await engine.session.login(form)
                            if(res.success){
                                navigator.go("home", undefined, undefined, true)
                                window.location.reload()
                            }
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
                <input type="hidden" name="token" value={token()}></input>
                <button type="submit">Sign up</button>
            </form>
        </div>
    )
}

export default Signup;