export type AssetsPaths = {
    site_icon: string,
    banner_bg: BannerBackgroundModel,
    banner_logo: BannerLogoModel,
    footer_bg: FooterBackgroundModel
}

export type BannerBackgroundModel = {
    src: string,
    show: boolean,
    background_type: string,
    background_size: string,
    background_position: string,
    background_repeat: boolean
}

export type FooterBackgroundModel = {
    src: string,
    show: boolean,
    background_size: string,
    background_position: string,
    background_repeat: boolean
}

export type BannerLogoModel = {
    src: string,
    show: boolean,
    border_radius: string
}

export type ColorsModel = {
    dark: {
        bg: string
        alternate_bg: string
        card_bg: string
        alternate_card_bg: string
        border: string
        banner: string
        text: string
        accent1: string
        accent2: string
        accent3: string 
        scrollbar_thumb: string
        pre: string
    }
    light: {
        bg: string
        alternate_bg: string
        card_bg: string
        alternate_card_bg: string
        border: string
        banner: string
        text: string
        accent1: string
        accent2: string
        accent3: string 
        scrollbar_thumb: string
        pre: string
    }
}

export type ConfigModel = {
    enable_private_repo: boolean,
    enable_forked_repo: boolean,
    logs_max_size_bytes: number,
    show_by_default: boolean,
    verbose_mode: boolean,
    providers: Array<string>,
    site_url: string
}

export type CommitModel = {
    author: string,
    message: string
}

export type PageInfo = {
    provider: string,
    id: string,
    repo_name: string,
    friendly_name: string,
    full_name: string,
    description: string | null,
    private: boolean,
    fork: boolean,
    url: string,
    readme_filename: string,
    created: string,
    last_update: string,
    featured: boolean,
    show: boolean
    last_commit: CommitModel
}

export type FilterPageModel = {
    shown: boolean | undefined
    featured: boolean | undefined
    homepage: boolean | undefined
}

export type APIKeyModel = {
    id: number
    provider: string
    username: string
    is_primary: boolean
}

export type NotifModel = {
    success: boolean
    msg: string
}

export type BlogPostModel = {
    post_id: string
    title: string
    timestamp: number
    linked_page: string
}

export type FilterBlogIndexModel = {
    linked_page: string | undefined
    start_date: number | undefined
    end_date: number | undefined
    start: number | undefined
    limit: number | undefined
    order: "asc" | "desc"
}