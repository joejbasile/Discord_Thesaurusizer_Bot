import type { ChatInputCommandInteraction, Message, TextBasedChannel } from 'discord.js'
import { splitContent } from '../lib/text.js'

/** Reply to an interaction, splitting the body across multiple messages if needed. */
export const respondToInteraction = async (
    interaction: ChatInputCommandInteraction,
    content: string
): Promise<void> => {
    const chunks = splitContent(content)
    await interaction.editReply({ content: chunks[0], allowedMentions: { parse: [] } })
    for (const chunk of chunks.slice(1)) {
        await interaction.followUp({ content: chunk, allowedMentions: { parse: [] } })
    }
}

/** Send a (possibly long) message into a channel. */
export const respondToChannel = async (
    channel: TextBasedChannel,
    content: string
): Promise<void> => {
    const chunks = splitContent(content)
    await channel.send({ content: chunks[0], allowedMentions: { parse: [] } })
    for (const chunk of chunks.slice(1)) {
        await channel.send({ content: chunk, allowedMentions: { parse: [] } })
    }
}

/** Reply to a specific message, splitting the body across multiple messages if needed. */
export const respondToMessage = async (
    message: Message,
    content: string
): Promise<void> => {
    const chunks = splitContent(content)
    await message.reply({ content: chunks[0], allowedMentions: { parse: [] } })
    for (const chunk of chunks.slice(1)) {
        await message.channel.send({ content: chunk, allowedMentions: { parse: [] } })
    }
}
