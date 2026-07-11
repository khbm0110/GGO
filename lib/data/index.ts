import { mockProvider } from './mock-provider';
import type { DataProvider } from './provider';

// 👉 THE ONLY LINE THAT WILL CHANGE WHEN APPWRITE IS READY:
// import { appwriteProvider } from './appwrite-provider';
// export const data: DataProvider = appwriteProvider;
export const data: DataProvider = mockProvider;
