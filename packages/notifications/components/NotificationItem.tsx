import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import React from 'react'
import { formatNumber } from '@play-money/finance/lib/formatCurrency'
import { calculateBalanceChanges, findBalanceChange } from '@play-money/finance/lib/helpers'
import { UserAvatar } from '@play-money/ui/UserAvatar'
import { cn } from '@play-money/ui/utils'
import { NotificationGroupWithLastNotification } from '../lib/getNotifications'

function createSnippet(htmlString: string, maxLength = 150) {
  const textContent = htmlString.replace(/<[^>]*>/g, '')
  const decodedText = decodeHTMLEntities(textContent)
  const trimmedText = decodedText.trim()

  if (trimmedText.length > maxLength) {
    return trimmedText.substring(0, maxLength).trim() + '...'
  }

  return trimmedText
}

function decodeHTMLEntities(text: string) {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  }
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, function (match) {
    return entities[match]
  })
}

export function NotificationItem({
  notification,
  count,
  unread = true,
}: {
  notification: NotificationGroupWithLastNotification['lastNotification']
  count: number
  unread: boolean
}) {
  let topLine = ''
  let bottomLine = ''

  const othersCount = count > 1 ? ` & ${count} other${count != 1 ? 's' : ''} ` : ''

  switch (notification.type) {
    case 'MARKET_RESOLVED': {
      topLine = notification.market.question
      bottomLine = `Resolved ${notification.marketOption.name} by ${notification.actor.displayName}`
      break
    }
    case 'MARKET_TRADE': {
      // Transactions Rewrite blew away old transactions.
      if (!notification.transaction) {
        topLine = notification.market.question
        bottomLine = 'Old bet'
        break
      }
      const balanceChanges = calculateBalanceChanges(notification.transaction)
      const primaryChange = findBalanceChange({
        balanceChanges,
        accountId: notification.actor.primaryAccountId,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
      })

      topLine = notification.market.question
      bottomLine = `${notification.actor.displayName} bet: ${formatNumber(Math.abs(primaryChange?.change ?? 0))} ${notification.marketOption.name}${othersCount}`
      break
    }
    case 'MARKET_LIQUIDITY_ADDED': {
      // Transactions Rewrite blew away old transactions.
      if (!notification.transaction) {
        topLine = notification.market.question
        bottomLine = 'Old bet'
        break
      }
      const balanceChanges = calculateBalanceChanges(notification.transaction)
      const primaryChange = findBalanceChange({
        balanceChanges,
        accountId: notification.actor.primaryAccountId,
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
      })

      topLine = notification.market.question
      bottomLine = `${formatNumber(Math.abs(primaryChange?.change ?? 0))} liquidity added by ${notification.actor.displayName}${othersCount}`
      break
    }
    case 'MARKET_COMMENT': {
      topLine = notification.market.question
      bottomLine = `${notification.actor.displayName} commented: ${createSnippet(notification.comment.content)}`
      break
    }
    case 'LIST_COMMENT': {
      topLine = notification.list.title
      bottomLine = `${notification.actor.displayName} commented: ${createSnippet(notification.comment.content)}`
      break
    }
    case 'COMMENT_REPLY': {
      topLine = notification.parentComment?.content
        ? createSnippet(notification.parentComment.content)
        : notification.market
          ? notification.market.question
          : notification.list
            ? notification.list.title
            : ''
      bottomLine = `${notification.actor.displayName}${othersCount} replied: ${createSnippet(notification.comment.content)}`
      break
    }
    case 'COMMENT_REACTION': {
      topLine = createSnippet(notification.comment.content)
      bottomLine = `${notification.actor.displayName}${othersCount} reacted: ${notification.commentReaction?.emoji}`
      break
    }
    case 'COMMENT_MENTION': {
      topLine = notification.parentComment?.content
        ? createSnippet(notification.parentComment.content)
        : notification.market
          ? notification.market.question
          : notification.list
            ? notification.list.title
            : ''
      bottomLine = `${notification.actor.displayName}${othersCount} mentioned you: ${createSnippet(notification.comment.content)}`
      break
    }
    // default: {
    //   topLine = notification.type
    //   bottomLine = ''
    // }
  }

  return (
    <Link href={notification.actionUrl}>
      <div className="flex min-w-0 gap-2 px-4 py-3">
        {notification.actor ? (
          <UserAvatar className="mt-1" user={notification.actor} />
        ) : (
          <div className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground"></div>
        )}

        <div className="min-w-0 flex-1">
          <div className={cn('mb-0.5 flex gap-2 text-sm', unread ? 'text-foreground' : 'text-muted-foreground')}>
            {unread ? <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></div> : null}
            <div className="truncate">{topLine}</div>
          </div>
          <div className="flex items-end gap-2 text-xs text-muted-foreground">
            <div className="line-clamp-3 min-w-0 flex-1">{bottomLine}</div>
            <div>
              {formatDistanceToNow(notification.createdAt)
                .replace('about ', '')
                .replace(/ years?/, 'y')
                .replace(/ months?/, 'm')
                .replace(/ weeks?/, 'w')
                .replace(/ days?/, 'd')
                .replace(/ hours?/, 'h')
                .replace(/ minutes?/, 'm')
                .replace(/ seconds?/, 's')}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
