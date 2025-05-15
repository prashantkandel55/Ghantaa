"use client"

// Client-side version of encryption.ts
// This file does NOT use any server-only APIs

// Simple encryption for client-side
export function encrypt(data: string): string {
  return btoa(encodeURIComponent(data))
}

// Simple decryption for client-side
export function decrypt(data: string): string {
  return decodeURIComponent(atob(data))
}

// Aliases for compatibility
export const encryptData = encrypt
export const decryptData = decrypt
