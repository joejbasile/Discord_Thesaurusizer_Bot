import type { Message } from 'discord.js'
import { logger } from '../logger.js'
import { acquireChannelLock } from '../services/channelLockService.js'
import { buildReplyBody, findPreviousMessage } from '../services/messageService.js'
import { respondToMessage } from '../services/responderService.js'
import { translateText } from '../services/translatorService.js'
import type { MessageChannel } from '../types.js'

/**
 * Legacy text trigger kept for backwards compatibility: typing "bump" (or
 * "!bump") in a channel does the same thing as the /bump slash command.
 */
export const handleMessageCreate = async (message: Message): Promise<void> => {
    if (message.author?.bot) return
    if (message.webhookId) return

    const content = message.content.trim().toLowerCase()
    if (content !== 'bump' && content !== '!bump') return

    const lock = acquireChannelLock(message.channelId)
    if (!lock.ok) {
        await message.reply({ content: lock.reason, allowedMentions: { parse: [] } })
        return
    }

    try {
        const target = await findPreviousMessage(message.channel as MessageChannel, 1, message.id)
        if (!target) {
            await message.reply({
                content: "Couldn't find a previous message with text to translate.",
                allowedMentions: { parse: [] }
            })
            return
        }

        const translated = await translateText(target.content)
        if (translated.trim() === target.content.trim()) {
            await message.reply({
                content: "I couldn't find any synonyms for that message — it's already as good as it gets.",
                allowedMentions: { parse: [] }
            })
            return
        }

        await respondToMessage(message, buildReplyBody(target, translated))
    } catch (error) {
        logger.error('[bump:legacy] failed:', error)
        await message
            .reply({ content: 'Something went wrong while bumping that message.', allowedMentions: { parse: [] } })
            .catch(() => undefined)
    } finally {
        lock.release()
    }
}
