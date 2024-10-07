export interface InboxEntryInput {
  guid: string;
  publishedAt: string;
  description?: string | null | undefined;
  title?: string | null | undefined;
  content?: string | null | undefined;
  author?: string | null | undefined;
  url?: string | null | undefined;
  media?:
    | {
        type: "photo" | "video";
        url: string;
        width?: number | undefined;
        height?: number | undefined;
        preview_image_url?: string | undefined;
        blurhash?: string | undefined;
      }[]
    | null
    | undefined;
  categories?: string[] | null | undefined;
  attachments?:
    | {
        url: string;
        title?: string | undefined;
        duration_in_seconds?: number | undefined;
        mime_type?: string | undefined;
        size_in_bytes?: number | undefined;
      }[]
    | null
    | undefined;
  extra?:
    | {
        links?:
          | {
              type: string;
              url: string;
              content_html?: string | undefined;
            }[]
          | null
          | undefined;
      }
    | null
    | undefined;
  authorUrl?: string | null | undefined;
  authorAvatar?: string | null | undefined;
  read?: boolean | null | undefined;
}

export interface InboxItem {
  type: "inbox";
  id: string;
  secret: string;
  description?: string | null | undefined;
  title?: string | null | undefined;
  image?: string | null | undefined;
  ownerUserId?: string | null | undefined;
  owner?:
    | {
        name: string | null;
        id: string;
        emailVerified: string | null;
        image: string | null;
        handle: string | null;
        createdAt: string;
      }
    | null
    | undefined;
}
