// Auto-generated by update-follow-api.ts, please do not modify by hand.
 
export const baseUrl = "https://api.follow.is";

export interface paths {
    "/inboxes/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Inbox get list */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 0;
                            data: {
                                id: string;
                                title?: string | null;
                                description?: string | null;
                                image?: string | null;
                                ownerUserId?: string | null;
                                owner?: {
                                    id: string;
                                    name: string | null;
                                    emailVerified: string | null;
                                    image: string | null;
                                    handle: string | null;
                                    createdAt: string;
                                } | null;
                                /** @enum {string} */
                                type: "inbox";
                                secret: string;
                            }[];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/inboxes/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        read?: boolean | null;
                        title?: string | null;
                        url?: string | null;
                        content?: string | null;
                        description?: string | null;
                        guid: string;
                        author?: string | null;
                        authorUrl?: string | null;
                        authorAvatar?: string | null;
                        categories?: string[] | null;
                        attachments?: {
                            url: string;
                            duration_in_seconds?: number;
                            mime_type?: string;
                            size_in_bytes?: number;
                            title?: string;
                        }[] | null;
                        media?: {
                            url: string;
                            /** @enum {string} */
                            type: "photo" | "video";
                            width?: number;
                            height?: number;
                            preview_image_url?: string;
                            blurhash?: string;
                        }[] | null;
                        extra?: {
                            links?: {
                                url: string;
                                type: string;
                                content_html?: string;
                            }[] | null;
                        } | null;
                        /** Format: date-time */
                        publishedAt: string;
                    };
                };
            };
            responses: {
                /** @description Inbox entry created */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {number} */
                            code: 0;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;