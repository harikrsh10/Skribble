import { createClient } from '@liveblocks/client'
import { createRoomContext } from '@liveblocks/react'

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || 'pk_test_your-key-here',
  throttle: 16,
})

// Presence represents the properties that exist on every user in the Room
type Presence = {
  cursor: { x: number; y: number } | null
  name: string
  isDrawing: boolean
  score: number
}

// Storage represents the shared document that persists in the Room
type Storage = {
  canvas: any
  game: any
}

// UserMeta represents static metadata on each user
type UserMeta = {
  id: string
  info: {
    name: string
    picture: string
  }
}

// RoomEvent represents custom events
type RoomEvent = {
  type: 'guess'
  word: string
  userId: string
}

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client) 