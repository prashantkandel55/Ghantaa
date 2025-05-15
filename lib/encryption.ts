// This is a browser-safe version of the encryption functions
// It does NOT use next/headers or any server-only APIs

// Simple encryption for client-side
export function encryptData(data: string): string {
  return btoa(data)
}

// Simple decryption for client-side
export function decryptData(data: string): string {
  return atob(data)
}

// Export encrypt function for compatibility
export const encrypt = encryptData

// Re-export from pure-encryption.ts
export * from "./pure-encryption"
