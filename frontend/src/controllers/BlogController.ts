import { api } from "./APIController";
import { format } from "date-fns";
import type { BlogPostModel, FilterBlogIndexModel } from "./Models";
import type { Setter } from "solid-js";
import type { BlogCreatorProps } from "../devtools/BlogCreator";

export class BlogController{
    blogCreatorSetter?: Setter<BlogCreatorProps|null>

    public loadSetter(setter: Setter<BlogCreatorProps|null>){
        this.blogCreatorSetter = setter;
    }

    public showCreator(content?: BlogPostModel){
        this.blogCreatorSetter!({content: content})
    }

    public hideCreator(){
        this.blogCreatorSetter!(null)
    }

    public generateTitle(){
        const now = new Date()
        return format(now, "dd MMMM - HH:mm")
    }

    public async getPosts(filter: Partial<FilterBlogIndexModel> = {}){
        const resolved: FilterBlogIndexModel = {
            linked_page: undefined,
            start_date: undefined,
            end_date: undefined,
            start: undefined,
            limit: undefined,
            order: "desc",
            ...filter
        }

        try{
            const res = await api.request(`/api/public/blog/get_index?${api.toQueryModel(resolved)}`)            
            return res as [BlogPostModel]
        } catch(e){
            console.error(e);
            return undefined
        }
    }

    public async getPost(post_id: string){
        try{
            const res = await api.request(`/api/public/blog/get?post_id=${post_id}`)

            return res as string
        } catch(e){
            console.error(e);
            return ""
        }
    }

    public async getMarkdown(post_id: string){
        try{
            const res = await api.request(`/api/admin/blog/get_markdown?post_id=${post_id}`);

            return res as string
        } catch(e){
            console.error(e);
            return ""
        }
    }

    public async uploadImage(image: File){
        const formData = new FormData()
        formData.append("image", image)

        try{
            const res = await api.request("/api/admin/blog/upload_image", {
                method: "POST",
                body: formData
            }, false)

            return res as string
        } catch{
            return ""
        }
    }

    public async post(data: FormData){
        try{
            const res = await api.request("/api/admin/blog/post", {
                method: "POST",
                body: data
            })

            return res
        } catch(e){
            console.error(e);
            return false
        }
    }

    public async deletePost(post_id: string){
        const formData = new FormData()
        formData.append("post_id", post_id)

        try{
            await api.request("/api/admin/blog/delete", {
                method: "DELETE",
                body: formData
            })
        } catch(e){
            console.error(e);
        }
    }

    public async update(data: FormData){
        try{
            const res = await api.request("/api/admin/blog/update", {
                method: "PUT",
                body: data
            })

            return res
        } catch(e){
            console.error(e);
            return false
        }
    }
}