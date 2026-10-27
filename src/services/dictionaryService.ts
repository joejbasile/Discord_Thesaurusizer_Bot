import { config } from '../config.js'
import { logger } from '../logger.js'
import { getRandomInt } from '../lib/random.js'
import type { DictionaryEntry, Inflection } from '../types.js'

interface CacheEntry {
    value: DictionaryEntry[] | null
    expiresAt: number
}

/** Shared across invocations so repeated words are only ever looked up once. */
const dictionaryCache = new Map<string, CacheEntry>()

const getCached = (word: string): DictionaryEntry[] | null | undefined => {
    const entry = dictionaryCache.get(word)
    if (!entry) return undefined
    if (entry.expiresAt <= Date.now()) {
        dictionaryCache.delete(word)
        return undefined
    }
    return entry.value
}

const setCached = (word: string, value: DictionaryEntry[] | null): void => {
    if (dictionaryCache.size >= config.maxCacheEntries) {
        const oldest = dictionaryCache.keys().next().value
        if (oldest !== undefined) dictionaryCache.delete(oldest)
    }
    const ttl = value === null ? config.negativeCacheTtlMs : config.cacheTtlMs
    dictionaryCache.set(word, { value, expiresAt: Date.now() + ttl })
}

const fetchWithTimeout = async (url: string, timeoutMs: number): Promise<Response> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        return await fetch(url, {
            signal: controller.signal,
            headers: { accept: 'application/json' }
        })
    } finally {
        clearTimeout(timer)
    }
}

/**
 * Fetch dictionary data for a word. Retries once because the free API can
 * be slow to respond, and caches both hits and misses.
 */
export const fetchWordData = async (word: string): Promise<DictionaryEntry[] | null> => {
    const cached = getCached(word)
    if (cached !== undefined) return cached

    const url = `${config.dictionaryEndpoint}/${encodeURIComponent(word)}`

    for (let attempt = 1; attempt <= config.maxRequestAttempts; attempt++) {
        try {
            const response = await fetchWithTimeout(url, config.httpTimeoutMs)

            if (response.status === 200) {
                const json: unknown = await response.json()
                const entries = Array.isArray(json) ? (json as DictionaryEntry[]) : null
                setCached(word, entries)
                return entries
            }

            // A 404 means the word simply isn't in the dictionary.
            if (response.status === 404) {
                setCached(word, null)
                return null
            }
        } catch (error) {
            logger.warn(
                `[dictionary] lookup failed for "${word}" (attempt ${attempt}/${config.maxRequestAttempts}):`,
                error instanceof Error ? error.message : error
            )
        }
    }

    return null
}

/**
 * Scan every entry and meaning for the word and return one random
 * single-word synonym. Multi-word synonyms (e.g. "look up") are skipped
 * because they break sentence structure. When the original word was an
 * inflected verb (gerund or past tense), only verb-part-of-speech synonyms
 * are considered, so a gerund never receives a noun replacement.
 */
export const pickSynonym = (
    entries: DictionaryEntry[],
    inflection: Inflection | null,
    originalWord: string
): string | null => {
    const verbOnly = inflection?.kind === 'ing' || inflection?.kind === 'ed'
    const candidates: string[] = []

    const collect = (value: unknown): void => {
        if (typeof value !== 'string') return
        if (!/^[a-zA-Z]+$/.test(value)) return
        if (value.toLowerCase() === originalWord.toLowerCase()) return
        candidates.push(value)
    }

    for (const entry of entries) {
        if (!entry || !Array.isArray(entry.meanings)) continue

        for (const meaning of entry.meanings) {
            if (!meaning) continue
            if (verbOnly && meaning.partOfSpeech !== 'verb') continue

            if (Array.isArray(meaning.synonyms)) {
                for (const synonym of meaning.synonyms) collect(synonym)
            }
            if (Array.isArray(meaning.definitions)) {
                for (const definition of meaning.definitions) {
                    if (definition && Array.isArray(definition.synonyms)) {
                        for (const synonym of definition.synonyms) collect(synonym)
                    }
                }
            }
        }

        // Entry-level synonyms are only safe for non-verb-only lookups.
        if (!verbOnly && Array.isArray(entry.synonyms)) {
            for (const synonym of entry.synonyms) collect(synonym)
        }
    }

    if (candidates.length === 0) return null
    return candidates[getRandomInt(candidates.length)]
}
