import { SlashCommandBuilder } from 'discord.js'
import type { ChatInputCommandInteraction } from 'discord.js'
import { client } from '../client.js'
import { logger } from '../logger.js'
import { acquireChannelLock } from '../services/channelLockService.js'
import { buildReplyBody, findPreviousMessage } from '../services/messageService.js'
import { respondToInteraction } from '../services/responderService.js'
import { translateText } from '../services/translatorService.js'
import type { Command, MessageChannel } from '../types.js'

export const bumpCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('bump')
        .setDescription('Replies to a previous message with synonyms.')
        .addIntegerOption((option) =>
            option
                .setName('depth')
                .setDescription('How many messages back to translate (1 = the message right before this one).')
                .setMinValue(1)
                .setMaxValue(5)
                .setDefault(1)
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply()

        const lock = acquireChannelLock(interaction.channelId)
        if (!lock.ok) {
            await interaction.editReply(lock.reason)
            return
        }

        try {
            const channel = await client.channels.fetch(interaction.channelId)
            if (!channel || !('messages' in channel)) {
                await interaction.editReply('This command can only be used in a text-based channel.')
                return
            }

            const depth = interaction.options.getInteger('depth') ?? 1
            const target = await findPreviousMessage(channel as MessageChannel, depth)

            if (!target) {
                await interaction.editReply("Couldn't find a previous message with text to translate.")
                return
            }

            const translated = await translateText(target.content)

            if (translated.trim() === target.content.trim()) {
                await interaction.editReply(
                    "I couldn't find any synonyms for that message — it's already as good as it gets."
                )
                return
            }

            await respondToInteraction(interaction, buildReplyBody(target, translated))
        } catch (error) {
            logger.error('[bump] failed:', error)
            await interaction
                .editReply('Something went wrong while bumping that message.')
                .catch(() => undefined)
        } finally {
            lock.release()
        }
    }
}
