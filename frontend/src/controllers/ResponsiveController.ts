class ResponsiveController{
    desktop = window.matchMedia("(min-width: 1000px)").matches;
    multiUseButton!: HTMLAnchorElement;
    navbox?: HTMLDivElement;
    aside?: HTMLElement;

    /**
     * Updates the state of the **desktop** property.
     * Used mainly for tablets where *landscape* and *portraits* views are frequently toggled.
     */
    public checkMedia(){
        this.desktop = window.matchMedia("(min-width: 1000px)").matches;
    }

    public toggleNavbox(force?: boolean){
        if(this.desktop) return
        let show = this.navbox?.classList.toggle("show", force)
        document.body.style = `overflow: ${(show) ? "hidden": "auto"}`;
    }
    
    public toggleAside(force?: boolean){
        if(this.desktop) return
        let show = this.aside?.classList.toggle("show", force)
        document.body.style = `overflow: ${(show) ? "hidden": "auto"}`;
    }

    public setMultiUseButtonLabel(label: string){
        this.multiUseButton.innerText = label;
    }
}

export const responsive = new ResponsiveController()