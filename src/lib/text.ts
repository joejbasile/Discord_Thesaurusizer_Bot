import { config } from '../config.js'

/**
 * Split text into word tokens (keeping internal apostrophes) and non-word
 * tokens (spaces, punctuation, emojis) that pass through verbatim so the
 * sentence's structure is preserved.
 */
export const tokenize = (content: string): string[] => content.match(/[\w']+|[^\w']+/g) ?? []

/** Split long content into <= limit character chunks, preferring word breaks. */
export const splitContent = (content: string, limit = config.messageChunkSize): string[] => {
    if (content.length <= limit) return [content]

    const chunks: string[] = []
    let remaining = content

    while (remaining.length > limit) {
        let cut = remaining.lastIndexOf(' ', limit)
        if (cut <= 0) cut = limit
        chunks.push(remaining.slice(0, cut).trimEnd())
        remaining = remaining.slice(cut).trimStart()
    }

    if (remaining.length > 0) chunks.push(remaining)
    return chunks
}
