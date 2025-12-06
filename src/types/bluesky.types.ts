// Bluesky API response types

export interface BlueskyAuthor {
  handle: string;
  displayName?: string;
  avatar?: string;
  did?: string;
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

export interface BlueskyEmbed {
  images?: BlueskyImage[];
  $type?: string;
}

export interface BlueskyRecord {
  text: string;
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
