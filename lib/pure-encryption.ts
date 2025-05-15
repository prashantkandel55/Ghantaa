"use client"

// Simple encryption for client-side
export function encrypt(data: string): string {
  return btoa(encodeURIComponent(data))
}

// Simple decryption for client-side
export function decrypt(data: string): string {
  return decodeURIComponent(atob(data))
}
