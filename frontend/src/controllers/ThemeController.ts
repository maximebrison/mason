import lightTheme from "../css/light.css?url"
import darkTheme from "../css/dark.css?url"

export class ThemeController{
    public dark!: boolean

    constructor(){
        if(localStorage.getItem("dark") === null){
            this.dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            localStorage.setItem("dark", `${this.dark}`)
        } else{
            this.dark = localStorage.getItem("dark") === "true";
        }
        
        this.switchTheme(true)
    }

    /**
     * 
     * @param init Force a value for the theme
     */
    public switchTheme(init: boolean = false){        
            const link = document.getElementById("theme") as HTMLLinkElement;
            let toDarkTheme: boolean;
            if(init){
                toDarkTheme = this.dark;
            } else{
                toDarkTheme = !this.dark;
                this.dark = !this.dark;
            }
            link.href = toDarkTheme ? darkTheme : lightTheme;
            localStorage.setItem("dark", `${this.dark}`)
        }
}