import type { Message } from 'discord.js'
import type { MessageChannel } from '../types.js'

/**
 * Find the Nth most recent human message with text. Bot messages (including
 * the bot's own reply) and the triggering message are skipped.
 */
export const findPreviousMessage = async (
    channel: MessageChannel,
    depth: number,
    excludeMessageId?: string
): Promise<Message | null> => {
    const limit = Math.min(Math.max(depth + 3, 4), 20)
    const messages = await channel.messages.fetch({ limit })

    const candidates = [...messages.values()]
        .filter((message) => message.author?.bot !== true)
        .filter((message) => message.id !== excludeMessageId)
        .filter((message) => message.content.trim().length > 0)
        .sort((a, b) => (BigInt(a.id) > BigInt(b.id) ? -1 : 1))

    return candidates[depth - 1] ?? null
}

export const sourceMessageLink = (message: Message): string | null => {
    if (!message.guildId) return null
    return `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
}

/** Build the human-facing "translation" message. */
export const buildReplyBody = (target: Message, translated: string): string => {
    const author = target.author?.displayName ?? target.author?.username ?? 'someone'
    const parts = [
        `Sounds like **${author}** is having some trouble with their words. I'll translate. This is what they're really trying to say:`,
        '',
        translated
    ]

    const link = sourceMessageLink(target)
    if (link) parts.push('', `[Original message](${link})`)

    return parts.join('\n')
}
