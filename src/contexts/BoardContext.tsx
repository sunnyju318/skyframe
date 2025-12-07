// ============================================================================
// 📌 BoardContext — Global board & saved-post management (Similar to Pinterest)
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import uuid from "react-native-uuid";

// Local storage manager
import {
  getBoardData,
  updateBoardData,
  addBoard as addBoardToStorage,
  updateBoard as updateBoardInStorage,
  deleteBoard as deleteBoardFromStorage,
  addPostToBoard as addPostToBoardInStorage,
  removePostFromBoard as removePostFromBoardInStorage,
} from "../services/BoardManager";

import { Board, BoardContextType, BlueskyPost } from "../types";

// Sample data placeholder (optional)
const sampleBoards: Board[] = [];

// ============================================================================
// Context Creation
// ============================================================================

const BoardContext = createContext<BoardContextType | undefined>(undefined);

interface BoardProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider Component
// ============================================================================

export function BoardProvider({ children }: BoardProviderProps) {
  // Global state
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Load boards on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    loadBoards();
  }, []);

  // ========================================================================
  // Load boards from storage
  // ========================================================================
  const loadBoards = async () => {
    try {
      const data = await getBoardData();
      setBoards(data);
    } catch (error) {
      console.log("loadBoards error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Reset all boards (clear local storage)
  // ========================================================================
  const resetBoards = async () => {
    try {
      await updateBoardData([]);
      setBoards([]);
      console.log("Boards reset successfully");
    } catch (error) {
      console.log("resetBoards error:", error);
    }
  };

  // ========================================================================
  // Add sample boards (developer utility)
  // ========================================================================
  const populateWithSampleData = async () => {
    try {
      await updateBoardData(sampleBoards);
      setBoards(sampleBoards);
      console.log("Sample data populated successfully");
    } catch (error) {
      console.log("populateWithSampleData error:", error);
      throw error;
    }
  };

  // ========================================================================
  // Create a new board
  // ========================================================================
  const createBoard = async (
    title: string,
    description: string = ""
  ): Promise<Board> => {
    try {
      const currentBoards = await getBoardData();

      const newBoard: Board = {
        id: uuid.v4() as string,
        title,
        description,
        posts: [],
        createdAt: new Date(),
      };

      addBoardToStorage(newBoard, currentBoards);
      await updateBoardData(currentBoards);
      setBoards(currentBoards);

      return newBoard;
    } catch (error) {
      console.log("createBoard error:", error);
      throw error;
    }
  };

  // ========================================================================
  // Update board info (title, description, etc.)
  // ========================================================================
  const updateBoard = async (
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board | undefined> => {
    try {
      const currentBoards = await getBoardData();
      const index = currentBoards.findIndex((b) => b.id === boardId);

      if (index !== -1) {
        const updatedBoard = {
          ...currentBoards[index],
          ...updates,
        };

        updateBoardInStorage(updatedBoard, currentBoards);
        await updateBoardData(currentBoards);
        setBoards(currentBoards);

        return updatedBoard;
      }
    } catch (error) {
      console.log("updateBoard error:", error);
      throw error;
    }
  };

  // ========================================================================
  // Delete a board
  // ========================================================================
  const deleteBoard = async (boardId: string): Promise<void> => {
    try {
      const currentBoards = await getBoardData();
      const filtered = deleteBoardFromStorage(boardId, currentBoards);
      await updateBoardData(filtered);
      setBoards(filtered);
    } catch (error) {
      console.log("deleteBoard error:", error);
      throw error;
    }
  };

  // ========================================================================
  // Save a post into a board
  // ========================================================================
  const savePostToBoard = async (
    boardId: string,
    post: BlueskyPost
  ): Promise<void> => {
    try {
      const currentBoards = await getBoardData();
      addPostToBoardInStorage(boardId, post, currentBoards);
      await updateBoardData(currentBoards);
      setBoards(currentBoards);
    } catch (error) {
      console.log("savePostToBoard error:", error);
      throw error;
    }
  };

  // ========================================================================
  // Remove a post from a board
  // ========================================================================
  const removePostFromBoard = async (
    boardId: string,
    postUri: string
  ): Promise<void> => {
    try {
      const currentBoards = await getBoardData();
      removePostFromBoardInStorage(boardId, postUri, currentBoards);
      await updateBoardData(currentBoards);
      setBoards(currentBoards);
    } catch (error) {
      console.log("removePostFromBoard error:", error);
      throw error;
    }
  };

  // ========================================================================
  // Helpers: find board / count / boards containing a post
  // ========================================================================

  const getBoardById = (boardId: string): Board | undefined => {
    return boards.find((board) => board.id === boardId);
  };

  const getBoardCount = (): number => {
    return boards.length;
  };

  const getBoardsWithPost = (postUri: string): Board[] => {
    return boards.filter((board) =>
      board.posts.some((post) => post.uri === postUri)
    );
  };

  // ========================================================================
  // Exported context value
  // ========================================================================
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
    resetBoards,
    populateWithSampleData,
  };

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}

// ============================================================================
// Hook — useBoardContext()
// ============================================================================

export function useBoardContext(): BoardContextType {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within BoardProvider");
  }
  return context;
}
