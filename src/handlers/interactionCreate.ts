import type { Interaction } from 'discord.js'
import { findCommand } from '../commands/index.js'
import { logger } from '../logger.js'

export const handleInteractionCreate = async (interaction: Interaction): Promise<void> => {
    if (!interaction.isChatInputCommand()) return

    const command = findCommand(interaction.commandName)
    if (!command) return

    try {
        await command.execute(interaction)
    } catch (error) {
        logger.error(`[interaction:${interaction.commandName}] failed:`, error)
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply('Something went wrong running that command.').catch(() => undefined)
        }
    }
}
