import { createContext, type ParentProps } from "solid-js";
import { Engine } from "../controllers/Engine";

export const EngineContext = createContext<Engine>();

export const EngineProvider = (props: ParentProps) => {
    return(
        <EngineContext.Provider value={new Engine()}>{props.children}</EngineContext.Provider>
    )
}