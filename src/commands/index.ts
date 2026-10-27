import { Routes } from 'discord.js'
import type { Client } from 'discord.js'
import { config } from '../config.js'
import { logger } from '../logger.js'
import { bumpCommand } from './bump.js'
import type { Command } from '../types.js'

/** Every command the bot exposes. Add new ones here. */
export const commands: Command[] = [bumpCommand]

export const findCommand = (name: string): Command | undefined =>
    commands.find((command) => command.data.name === name)

export const commandPayload = () => commands.map((command) => command.data.toJSON())

/** Register the slash commands globally, or to a single guild for instant use. */
export const deployCommands = async (client: Client): Promise<void> => {
    const applicationId = client.user?.id
    if (!applicationId) {
        logger.error('Cannot deploy commands: client is not ready.')
        return
    }

    const body = commandPayload()

    try {
        if (config.guildId) {
            await client.rest.put(Routes.applicationGuildCommands(applicationId, config.guildId), { body })
            logger.info(`Registered commands to guild ${config.guildId} (takes effect immediately).`)
        } else {
            await client.rest.put(Routes.applicationCommands(applicationId), { body })
            logger.info('Registered commands globally (can take up to an hour to propagate).')
        }
    } catch (error) {
        logger.error('Failed to register slash commands:', error)
    }
}
