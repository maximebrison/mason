import { createContext, type ParentProps } from "solid-js";
import { Navigator } from "../controllers/Navigator";

export const NavigatorContext = createContext<Navigator>();

export const NavigatorProvider = (props: ParentProps) => {
    return(
        <NavigatorContext.Provider value={new Navigator()}>{props.children}</NavigatorContext.Provider>
    )
}