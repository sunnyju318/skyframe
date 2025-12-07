// ============================================================================
// 📦 BoardManager — Board data management using AsyncStorage
// ============================================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Board, BlueskyPost } from "../types";

const STORAGE_KEY = "BOARD_DATA";

// ============================================================================
// Async APIs — Load / Save boards
// ============================================================================

// Get all boards from storage
export async function getBoardData(): Promise<Board[]> {
  let boards: Board[] = [];

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (raw !== null && raw !== undefined) {
      boards = JSON.parse(raw);

      // Convert date strings back to Date objects
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

// Overwrite all boards in storage
export async function updateBoardData(boards: Board[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (error) {
    console.log("updateBoardData error:", error);
  }
}

// ============================================================================
// Synchronous utilities — Mutate in-memory board arrays
// ============================================================================

// Find board index by ID
export function getBoardIndex(boardId: string, currentBoards: Board[]): number {
  return currentBoards.findIndex((board) => board.id === boardId);
}

// Add new board to list (mutates array)
export function addBoard(newBoard: Board, currentBoards: Board[]): void {
  currentBoards.push(newBoard);
}

// Replace existing board with updated one (mutates array)
export function updateBoard(updatedBoard: Board, currentBoards: Board[]): void {
  const index = getBoardIndex(updatedBoard.id, currentBoards);
  if (index > -1) {
    currentBoards[index] = updatedBoard;
  }
}

// Delete a board and return new list
export function deleteBoard(boardId: string, currentBoards: Board[]): Board[] {
  return currentBoards.filter((board) => board.id !== boardId);
}

// ============================================================================
// Post ↔ Board helpers
// ============================================================================

// Add a post to a board (prevents duplicates)
// Returns true if added, false if already existed or board not found
export function addPostToBoard(
  boardId: string,
  post: BlueskyPost,
  currentBoards: Board[]
): boolean {
  const index = getBoardIndex(boardId, currentBoards);

  if (index > -1) {
    // Ensure posts array exists
    if (!currentBoards[index].posts) {
      currentBoards[index].posts = [];
    }

    const alreadySaved = currentBoards[index].posts.some(
      (p) => p.uri === post.uri
    );

    if (!alreadySaved) {
      currentBoards[index].posts.push(post);
      return true;
    }
  }

  return false;
}

// Remove a post from a board (mutates array)
export function removePostFromBoard(
  boardId: string,
  postUri: string,
  currentBoards: Board[]
): void {
  const index = getBoardIndex(boardId, currentBoards);

  if (index > -1) {
    currentBoards[index].posts = currentBoards[index].posts.filter(
      (post) => post.uri !== postUri
    );
  }
}
