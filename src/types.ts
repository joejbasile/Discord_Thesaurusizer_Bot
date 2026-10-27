import type { MessageManager, SlashCommandBuilder, TextBasedChannel } from 'discord.js'
import type { ChatInputCommandInteraction } from 'discord.js'

// --- Dictionary API ---------------------------------------------------------

export interface DictionaryDefinition {
    definition?: string
    synonyms?: string[]
    antonyms?: string[]
}

export interface DictionaryMeaning {
    partOfSpeech?: string
    synonyms?: string[]
    antonyms?: string[]
    definitions?: DictionaryDefinition[]
}

export interface DictionaryEntry {
    word?: string
    synonyms?: string[]
    antonyms?: string[]
    meanings?: DictionaryMeaning[]
}

// --- Morphology -------------------------------------------------------------

export type InflectionKind = 'ing' | 'ed' | 's'

export interface Inflection {
    kind: InflectionKind
    stem: string
}

// --- Discord ----------------------------------------------------------------

/** A channel we know exposes message history. */
export type MessageChannel = TextBasedChannel & { messages: MessageManager }

export type ChannelLock =
    | { ok: true; release: () => void }
    | { ok: false; reason: string }

export interface Command {
    data: SlashCommandBuilder
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}
