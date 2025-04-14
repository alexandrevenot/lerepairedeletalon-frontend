import { Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    constructor(private title: Title, private meta: Meta) {}

    initSeo(data: {title?: string, meta?: Array<Record<string, string>>}) {
        data.title && this.title.setTitle(data.title);
        data.meta && data.meta.forEach((tag) => {
            this.meta.updateTag(tag);
        })
    }
}