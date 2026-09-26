'use client'

import { Check, UserPlus } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Button } from '@/components/ui/button'

/** Renders nothing for you or existing friends. */
export function AddFriendButton({ userId, className }: { userId: string; className?: string }) {
  const { currentUser, friendIds, requestedIds, requestFriend } = useApp()
  if (userId === currentUser.id || friendIds.has(userId)) return null

  return requestedIds.has(userId) ? (
    <Button size="sm" variant="secondary" disabled className={className}>
      <Check data-icon="inline-start" />
      Requested
    </Button>
  ) : (
    <Button size="sm" variant="secondary" onClick={() => requestFriend(userId)} className={className}>
      <UserPlus data-icon="inline-start" />
      Add friend
    </Button>
  )
}
