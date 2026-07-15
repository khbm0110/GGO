import { mockAuth } from './mock-auth';
import type { AuthProvider } from './provider';

// Switched to mock-auth for AI Studio execution
export const auth: AuthProvider = mockAuth;
