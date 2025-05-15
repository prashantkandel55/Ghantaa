"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

type SubscriptionCallback<T> = (payload: { new: T; old: T | null }) => void

export function useRealtimeSubscription<T>(
  table: string,
  callback: SubscriptionCallback<T>,
  options?: {
    event?: "INSERT" | "UPDATE" | "DELETE" | "*"
    filter?: string
    filterValue?: any
  },
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient()

    // Create a channel for the subscription
    const channelName = `realtime:${table}:${options?.event || "*"}:${options?.filter || "*"}`
    const newChannel = supabase.channel(channelName)

    // Build the subscription
    let subscription = newChannel.on(
      "postgres_changes",
      {
        event: options?.event || "*",
        schema: "public",
        table: table,
        ...(options?.filter && options?.filterValue ? { filter: `${options.filter}=eq.${options.filterValue}` } : {}),
      },
      (payload) => {
        callback(payload as any)
      },
    )

    // Subscribe to connection status
    subscription = subscription
      .on("system", { event: "connected" }, () => {
        setIsConnected(true)
      })
      .on("system", { event: "disconnected" }, () => {
        setIsConnected(false)
      })
      .on("system", { event: "error" }, (err) => {
        setError(err as any)
      })

    // Subscribe to the channel
    subscription.subscribe()
    setChannel(newChannel)

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [table, options?.event, options?.filter, options?.filterValue, callback])

  return { isConnected, error }
}
