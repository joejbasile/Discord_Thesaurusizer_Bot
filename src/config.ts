const readPositiveInt = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const config = {
    token: process.env.TOKEN?.trim() ?? '',
    guildId: process.env.GUILD_ID?.trim() ?? '',

    /** Per-channel cooldown between bumps (ms). */
    bumpCooldownMs: readPositiveInt(process.env.BUMP_COOLDOWN_MS, 5_000),

    dictionaryEndpoint: 'https://api.dictionaryapi.dev/api/v2/entries/en',
    httpTimeoutMs: 10_000,
    translateBudgetMs: 45_000,
    maxRequestAttempts: 2,

    messageChunkSize: 2_000,

    cacheTtlMs: 24 * 60 * 60 * 1_000,
    negativeCacheTtlMs: 10 * 60 * 1_000,
    maxCacheEntries: 5_000
} as const

export const hasToken = (): boolean => config.token.length > 0
