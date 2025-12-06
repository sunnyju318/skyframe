// Global Board state management using Context API
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import uuid from "react-native-uuid";

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

// Sample data will be added later
const sampleBoards: Board[] = [];

// Create Context
const BoardContext = createContext<BoardContextType | undefined>(undefined);

// Provider component
interface BoardProviderProps {
  children: ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  // State
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadBoards();
  }, []);

  // ========== Load boards ==========
  const loadBoards = async () => {
    try {
      const data = await getBoardData();
      setBoards(data);
      setLoading(false);
    } catch (error) {
      console.log("loadBoards error:", error);
      setLoading(false);
    }
  };

  // ========== Reset boards ==========
  const resetBoards = async () => {
    try {
      await updateBoardData([]);
      setBoards([]);
      console.log("Boards reset successfully");
    } catch (error) {
      console.log("resetBoards error:", error);
    }
  };

  // ========== Populate with sample data ==========
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

  // ========== Create board ==========
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

  // ========== Update board ==========
  const updateBoard = async (
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board | undefined> => {
    try {
      const currentBoards = await getBoardData();
      const boardIndex = currentBoards.findIndex((b) => b.id === boardId);

      if (boardIndex !== -1) {
        const updatedBoard = {
          ...currentBoards[boardIndex],
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

  // ========== Delete board ==========
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

  // ========== Save post to board ==========
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

  // ========== Remove post from board ==========
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

  // ========== Find specific board ==========
  const getBoardById = (boardId: string): Board | undefined => {
    return boards.find((board) => board.id === boardId);
  };

  // ========== Get board count ==========
  const getBoardCount = (): number => {
    return boards.length;
  };

  // ========== Find boards containing a post ==========
  const getBoardsWithPost = (postUri: string): Board[] => {
    return boards.filter((board) =>
      board.posts.some((post) => post.uri === postUri)
    );
  };

  // Context value
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

// Custom Hook
export function useBoardContext(): BoardContextType {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within BoardProvider");
  }
  return context;
}
