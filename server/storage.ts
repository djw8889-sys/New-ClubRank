// This file is not used in the current Firebase-based architecture
// The app uses Firebase Firestore for all data storage
// Kept for potential future backend expansion

export interface IStorage {
  // Placeholder for future backend storage interface if needed
}

export class MemStorage implements IStorage {
  // Placeholder implementation - not currently used
  // App uses Firebase Firestore directly
}

export const storage = new MemStorage();