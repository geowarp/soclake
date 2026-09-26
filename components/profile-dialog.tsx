'use client'

import { Sparkles } from 'lucide-react'
import { AddFriendButton } from '@/components/add-friend-button'
import { useApp } from '@/components/app-provider'
import { FriendProgress } from '@/components/friendship'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ProfileDialog({
  userId,
  onClose,
}: {
  userId: string | null
  onClose: () => void
}) {
  const { getUser, friendships, currentUser } = useApp()
  const user = userId ? getUser(userId) : undefined
  const friendship = friendships.find((f) => f.friendId === userId)
  const isYou = userId === currentUser.id

  return (
    <Dialog open={!!userId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden rounded-3xl border-border bg-card p-0">
        {user && (
          <div>
            <div className="relative h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent">
              <div className="absolute -bottom-9 left-5">
                <Avatar className="size-20 border-4 border-card shadow-lg">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="px-5 pb-5 pt-11">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="font-display text-xl">{user.name}</DialogTitle>
                <p className="flex items-center gap-1.5 text-sm text-accent">
                  <Sparkles className="size-3.5" />
                  {user.vibe}
                </p>
              </DialogHeader>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {user.bio}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {user.interests.map((i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="rounded-full font-normal capitalize"
                  >
                    {i}
                  </Badge>
                ))}
              </div>

              <AddFriendButton userId={user.id} className="mt-5 w-full" />

              {!isYou && friendship && (
                <div className="mt-5 rounded-2xl bg-secondary/50 p-4">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Your friendship
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {friendship.sharedEvents} events together
                    </span>
                  </div>
                  <FriendProgress minutes={friendship.sharedMinutes} />
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
