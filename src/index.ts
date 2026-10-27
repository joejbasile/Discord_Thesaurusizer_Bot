import dotenv from 'dotenv'
import { config, hasToken } from './config.js'
import { client } from './client.js'
import { deployCommands } from './commands/index.js'
import { handleInteractionCreate } from './handlers/interactionCreate.js'
import { handleMessageCreate } from './handlers/messageCreate.js'
import { logger } from './logger.js'

dotenv.config()

client.on('ready', () => {
    logger.info(`Logged in as ${client.user?.tag} (${client.user?.id})`)
})

client.once('ready', () => {
    void deployCommands(client)
})

client.on('interactionCreate', (interaction) => {
    void handleInteractionCreate(interaction)
})

client.on('messageCreate', (message) => {
    void handleMessageCreate(message)
})

client.on('error', (error) => logger.error('[client] error:', error))
client.on('shardError', (error) => logger.error('[client] shard error:', error))

process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection:', reason))
process.on('uncaughtException', (error) => logger.error('Uncaught exception:', error))

if (!hasToken()) {
    logger.error('Missing TOKEN environment variable. Add it to your .env file and try again.')
    process.exit(1)
}

client.login(config.token).catch((error) => {
    logger.error('Failed to log in:', error)
    process.exit(1)
})
