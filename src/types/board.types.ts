// Board and saved post types
import { BlueskyPost } from "./bluesky.types";

export interface Board {
  id: string;
  title: string;
  description?: string;
  posts: BlueskyPost[];
  createdAt: Date;
  isPrivate?: boolean;
}

export interface BoardContextType {
  boards: Board[];
  loading: boolean;
  loadBoards: () => Promise<void>;
  createBoard: (title: string, description?: string) => Promise<Board>;
  updateBoard: (
    boardId: string,
    updates: Partial<Board>
  ) => Promise<Board | undefined>;
  deleteBoard: (boardId: string) => Promise<void>;
  savePostToBoard: (boardId: string, post: BlueskyPost) => Promise<void>;
  removePostFromBoard: (boardId: string, postUri: string) => Promise<void>;
  getBoardById: (boardId: string) => Board | undefined;
  getBoardCount: () => number;
  getBoardsWithPost: (postUri: string) => Board[];
  resetBoards: () => Promise<void>;
  populateWithSampleData: () => Promise<void>;
}
