// ============================================================================
// Board and saved post types (Supabase)
// ============================================================================

import { BlueskyPost } from "./bluesky.types";

export interface Board {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardPost {
  id: string;
  board_id: string;
  post_uri: string;
  created_at: string;
}

export interface BoardWithPosts extends Board {
  posts: BlueskyPost[];
}

export interface BoardContextType {
  boards: BoardWithPosts[];
  loading: boolean;
  loadBoards: () => Promise<void>;
  createBoard: (
    title: string,
    description?: string,
    isPrivate?: boolean
  ) => Promise<Board>;
  updateBoard: (
    boardId: string,
    updates: Partial<Board>
  ) => Promise<Board | undefined>;
  deleteBoard: (boardId: string) => Promise<void>;
  savePostToBoard: (boardId: string, post: BlueskyPost) => Promise<void>;
  removePostFromBoard: (boardId: string, postUri: string) => Promise<void>;
  getBoardById: (boardId: string) => BoardWithPosts | undefined;
  getBoardCount: () => number;
  getBoardsWithPost: (postUri: string) => BoardWithPosts[];
}
