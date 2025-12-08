// ============================================================================
// BoardContext — Global board management with Supabase
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";
import { Board, BoardContextType, BoardWithPosts, BoardPost } from "../types";
import { BlueskyPost } from "../types";
import { getPost } from "../services/blueskyApi";

const BoardContext = createContext<BoardContextType | undefined>(undefined);

interface BoardProviderProps {
  children: ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  const { user } = useAuth();
  const [boards, setBoards] = useState<BoardWithPosts[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Load boards on mount and when user changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (user?.did) {
      loadBoards();
    } else {
      setBoards([]);
      setLoading(false);
    }
  }, [user?.did]);

  // --------------------------------------------------------------------------
  // Load boards from Supabase
  // --------------------------------------------------------------------------
  const loadBoards = async () => {
    if (!user?.did) return;

    try {
      setLoading(true);

      // Fetch boards
      const { data: boardsData, error: boardsError } = await supabase
        .from("boards")
        .select("*")
        .eq("user_id", user.did)
        .order("created_at", { ascending: false });

      if (boardsError) throw boardsError;

      // Fetch board posts
      const boardIds = boardsData?.map((b) => b.id) || [];

      let boardPostsData: BoardPost[] = [];
      if (boardIds.length > 0) {
        const { data, error } = await supabase
          .from("board_posts")
          .select("*")
          .in("board_id", boardIds);

        if (error) throw error;
        boardPostsData = data || [];
      }

      // Fetch actual post data from Bluesky
      const uniqueUris = [...new Set(boardPostsData.map((bp) => bp.post_uri))];
      const postPromises = uniqueUris.map((uri) => getPost(uri));
      const postsData = await Promise.all(postPromises);

      const postsMap = new Map<string, BlueskyPost>();
      postsData.forEach((post, index) => {
        if (post) {
          postsMap.set(uniqueUris[index], post);
        }
      });

      // Combine boards with posts
      const boardsWithPosts: BoardWithPosts[] = (boardsData || []).map(
        (board) => ({
          ...board,
          posts: boardPostsData
            .filter((bp) => bp.board_id === board.id)
            .map((bp) => postsMap.get(bp.post_uri))
            .filter((p): p is BlueskyPost => p !== undefined),
        })
      );

      setBoards(boardsWithPosts);
    } catch (error) {
      console.error("Error loading boards:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Create a new board
  // --------------------------------------------------------------------------
  const createBoard = async (
    title: string,
    description: string = "",
    isPrivate: boolean = false
  ): Promise<Board> => {
    if (!user?.did) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("boards")
      .insert({
        user_id: user.did,
        title,
        description,
        is_private: isPrivate,
      })
      .select()
      .single();

    if (error) throw error;

    await loadBoards();
    return data;
  };

  // --------------------------------------------------------------------------
  // Update board
  // --------------------------------------------------------------------------
  const updateBoard = async (
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board | undefined> => {
    const { data, error } = await supabase
      .from("boards")
      .update(updates)
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;

    await loadBoards();
    return data;
  };

  // --------------------------------------------------------------------------
  // Delete board
  // --------------------------------------------------------------------------
  const deleteBoard = async (boardId: string): Promise<void> => {
    const { error } = await supabase.from("boards").delete().eq("id", boardId);

    if (error) throw error;

    await loadBoards();
  };

  // --------------------------------------------------------------------------
  // Save post to board
  // --------------------------------------------------------------------------
  const savePostToBoard = async (
    boardId: string,
    post: BlueskyPost
  ): Promise<void> => {
    const { error } = await supabase.from("board_posts").insert({
      board_id: boardId,
      post_uri: post.uri,
    });

    if (error) throw error;

    await loadBoards();
  };

  // --------------------------------------------------------------------------
  // Remove post from board
  // --------------------------------------------------------------------------
  const removePostFromBoard = async (
    boardId: string,
    postUri: string
  ): Promise<void> => {
    const { error } = await supabase
      .from("board_posts")
      .delete()
      .eq("board_id", boardId)
      .eq("post_uri", postUri);

    if (error) throw error;

    await loadBoards();
  };

  // --------------------------------------------------------------------------
  // Helper functions
  // --------------------------------------------------------------------------
  const getBoardById = (boardId: string): BoardWithPosts | undefined => {
    return boards.find((board) => board.id === boardId);
  };

  const getBoardCount = (): number => {
    return boards.length;
  };

  const getBoardsWithPost = (postUri: string): BoardWithPosts[] => {
    return boards.filter((board) =>
      board.posts.some((post) => post.uri === postUri)
    );
  };

  // --------------------------------------------------------------------------
  // Context value
  // --------------------------------------------------------------------------
  const value: BoardContextType = {
    boards,
    loading,
    loadBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    savePostToBoard,
    removePostFromBoard,
    getBoardById,
    getBoardCount,
    getBoardsWithPost,
  };

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}

export function useBoardContext(): BoardContextType {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within BoardProvider");
  }
  return context;
}
