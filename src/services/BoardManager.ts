// Board data management using AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Board, BlueskyPost } from "../types";

const STORAGE_KEY = "BOARD_DATA";

/* ========== ASYNC FUNCTIONS ========== */

// Get all boards
export async function getBoardData(): Promise<Board[]> {
  let boards: Board[] = [];

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (raw !== null && raw !== undefined) {
      boards = JSON.parse(raw);

      // Convert date strings to Date objects
      boards = boards.map((board) => ({
        ...board,
        createdAt: new Date(board.createdAt),
      }));
    }
  } catch (error) {
    console.log("getBoardData error:", error);
  }

  return boards;
}

// Get a single board by ID
export async function getBoardById(boardId: string): Promise<Board | null> {
  try {
    const boards = await getBoardData();
    return boards.find((board) => board.id === boardId) || null;
  } catch (error) {
    console.log("getBoardById error:", error);
    return null;
  }
}

// Save/overwrite board data
export async function updateBoardData(boards: Board[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (error) {
    console.log("updateBoardData error:", error);
  }
}

/* ========== UTILITY FUNCTIONS ========== */

// Find board index
export function getBoardIndex(boardId: string, currentBoards: Board[]): number {
  return currentBoards.findIndex((board) => board.id === boardId);
}

// Add new board
export function addBoard(newBoard: Board, currentBoards: Board[]): void {
  currentBoards.push(newBoard);
}

// Update board info
export function updateBoard(updatedBoard: Board, currentBoards: Board[]): void {
  const boardIndex = getBoardIndex(updatedBoard.id, currentBoards);
  if (boardIndex > -1) {
    currentBoards[boardIndex] = updatedBoard;
  }
}

// Delete board
export function deleteBoard(boardId: string, currentBoards: Board[]): Board[] {
  return currentBoards.filter((board) => board.id !== boardId);
}

// Add post to board
export function addPostToBoard(
  boardId: string,
  post: BlueskyPost,
  currentBoards: Board[]
): boolean {
  const boardIndex = getBoardIndex(boardId, currentBoards);

  if (boardIndex > -1) {
    // Create posts array if it doesn't exist
    if (!currentBoards[boardIndex].posts) {
      currentBoards[boardIndex].posts = [];
    }

    // Check if post is already saved (prevent duplicates)
    const alreadySaved = currentBoards[boardIndex].posts.some(
      (p) => p.uri === post.uri
    );

    if (!alreadySaved) {
      currentBoards[boardIndex].posts.push(post);
      return true;
    }
  }

  return false;
}

// Remove post from board
export function removePostFromBoard(
  boardId: string,
  postUri: string,
  currentBoards: Board[]
): void {
  const boardIndex = getBoardIndex(boardId, currentBoards);

  if (boardIndex > -1) {
    currentBoards[boardIndex].posts = currentBoards[boardIndex].posts.filter(
      (post) => post.uri !== postUri
    );
  }
}
