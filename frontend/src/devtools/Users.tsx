import { createSignal, For, onMount, useContext, type Setter } from "solid-js";
import { EngineContext } from "../context/EngineContext";
import { utils } from "../controllers/Utilities";
import { api } from "../controllers/APIController";
import "./css/users.css"

function Users(){
    const engine = useContext(EngineContext)!;
    const [users, setUsers] = createSignal<string[]|undefined>(undefined);

    onMount(async () => {
        setUsers(await engine.session.getUsers())        
    })

    return(
        <div class="config-page users">
            <h1>Users settings</h1>
            <div class="content">
                <For each={users()}>
                    {(u) => (
                        <User setUsers={setUsers} username={u}/>
                    )}
                </For>
            </div>
            <div class="bottom">
                <button 
                    class="validate"
                    onClick={async () => {
                        const joinUrl = await engine.session.getSignupURL();
                        if(joinUrl !== undefined){
                            utils.popup(
                                <div class="popup-content">
                                    <h1>Copy and share link below :</h1>
                                    <pre>{joinUrl}</pre>
                                    <i>{"(Valid for 5 minutes)"}</i>
                                </div>
                            )
                        }
                    }}
                >
                    Add user
                </button>
            </div>
        </div>
    )
}

function User(props: {setUsers: Setter<string[]|undefined>, username: string}){
    const engine = useContext(EngineContext)!;    

    return(
        <div class="user burger">
             <div 
                class="title"
                onClick={(e) => {
                    const elem = (e.target.parentElement as HTMLDivElement);
                    let self = false;
                    elem.parentElement!.querySelectorAll(".show").forEach((node) => {
                        (node === elem) ? self = true : null;
                        node.classList.remove("show");
                    })
                    if(!self){
                        elem.classList.add("show");
                    }
                }}
            >
                {props.username}
            </div>
            <div class="dropdown">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        if(!formData.get("current") || !formData.get("new") || !formData.get("retype")){
                            api.notif({
                                success: false, 
                                msg: "Missing fields"
                            })
                        } else if(formData.get("new") !== formData.get("retype")){
                            api.notif({
                                success: false, 
                                msg: "Passwords don't match"
                            })
                        } else if(formData.get("new")!.toString().length < 8){
                            api.notif({
                                success: false, 
                                msg: "New password should be at least 8 characters."
                            })
                        } else{
                            formData.delete("retype")
                            engine.session.changePassword(formData)
                            e.currentTarget.reset()
                        }
                    }}
                >
                    <input type="hidden" name="username" value={props.username}></input>
                    <div class="entry">
                        <span class="key">
                            Old password
                        </span>
                        <span class="value">
                            <input type="password" name="current" autocomplete="current-password"></input>
                        </span>
                    </div>
                    <div class="entry">
                        <span class="key">
                            New password
                        </span>
                        <span class="value">
                            <input type="password" name="new" autocomplete="new-password"></input>
                        </span>
                    </div>
                    <div class="entry">
                        <span class="key">
                            Retype new password
                        </span>
                        <span class="value">
                            <input type="password" name="retype" autocomplete="new-password"></input>
                        </span>
                    </div>
                    <div class="entry single">
                        <button type="submit">Save</button>
                    </div>
                </form>
                <div class="entry">
                    <span class="key">
                        Delete user
                    </span>
                    <span class="value">
                        <button 
                            class="sensible"
                            onClick={() => {
                                utils.alert(
                                    `Delete ${props.username} ?`,
                                    () => {
                                        engine.session.popUser(props.username).then(async () => {
                                            props.setUsers(await engine.session.getUsers())
                                        })
                                    },
                                    false
                                )
                            }}
                        >
                            Delete
                        </button>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Users;