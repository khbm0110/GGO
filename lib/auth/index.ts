import { mockAuth } from './mock-auth';
import type { AuthProvider } from './provider';

// 👉 THE ONLY LINE THAT WILL CHANGE WHEN APPWRITE AUTH IS READY:
// import { appwriteAuth } from './appwrite-auth';
// export const auth: AuthProvider = appwriteAuth;
export const auth: AuthProvider = mockAuth;
