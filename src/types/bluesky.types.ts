// Bluesky API response types

export interface BlueskyViewer {
  following?: string; // Follow record URI if following
  followedBy?: string; // Follow record URI if followed by this user
  muted?: boolean;
  blockedBy?: boolean;
}

export interface BlueskyAuthor {
  handle: string;
  displayName?: string;
  avatar?: string;
  did?: string;
  viewer?: BlueskyViewer;
}

export interface BlueskyImage {
  thumb: string;
  fullsize: string;
  alt?: string;
  aspectRatio?: {
    width: number;
    height: number;
  };
}

// Embed types - using union type for different embed kinds
export interface BlueskyImageEmbed {
  $type: "app.bsky.embed.images";
  images: BlueskyImage[];
}

export interface BlueskyExternalEmbed {
  $type: "app.bsky.embed.external";
  external: any;
}

export interface BlueskyRecordEmbed {
  $type: "app.bsky.embed.record";
  record: any;
}

export type BlueskyEmbed =
  | BlueskyImageEmbed
  | BlueskyExternalEmbed
  | BlueskyRecordEmbed
  | {
      $type?: string;
      images?: BlueskyImage[];
      external?: any;
      record?: any;
    };

export interface BlueskyRecord {
  text?: string;
  createdAt?: string;
  $type?: string;
}

export interface BlueskyPost {
  uri: string;
  cid?: string;
  author: BlueskyAuthor;
  record: BlueskyRecord;
  embed?: BlueskyEmbed;
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
  indexedAt?: string;
}

export interface BlueskyFeedItem {
  post: BlueskyPost;
  reply?: any;
  reason?: any;
}

export interface BlueskyTimelineResponse {
  feed: BlueskyFeedItem[];
  cursor?: string;
}

export interface BlueskySearchResponse {
  posts: BlueskyPost[];
  cursor?: string;
}

// Profile data returned from API
export interface ProfileData {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  did?: string;
  viewer?: BlueskyViewer;
}
