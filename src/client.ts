import { Client, GatewayIntentBits } from 'discord.js'

/**
 * The bot needs Guilds + GuildMessages to read history, and the privileged
 * MessageContent intent to read other users' message text.
 */
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})
