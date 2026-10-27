import { config } from '../config.js'
import type { ChannelLock } from '../types.js'

/**
 * Per-channel lock: prevents two bumps running at once and rate limits the
 * command so the public dictionary API cannot be hammered.
 */
const channelLocks = new Map<string, { busy: boolean; lastRun: number }>()

export const acquireChannelLock = (channelId: string): ChannelLock => {
    const now = Date.now()
    const state = channelLocks.get(channelId) ?? { busy: false, lastRun: 0 }

    if (state.busy) {
        return { ok: false, reason: 'A bump is already running in this channel — give it a moment.' }
    }

    if (now - state.lastRun < config.bumpCooldownMs) {
        const wait = Math.ceil((config.bumpCooldownMs - (now - state.lastRun)) / 1000)
        return { ok: false, reason: `Slow down a little — try again in ${wait}s.` }
    }

    state.busy = true
    channelLocks.set(channelId, state)

    return {
        ok: true,
        release: () => {
            const current = channelLocks.get(channelId)
            if (current) {
                current.busy = false
                current.lastRun = Date.now()
            }
        }
    }
}
