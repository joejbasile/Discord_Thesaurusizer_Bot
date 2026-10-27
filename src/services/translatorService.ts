import { config } from '../config.js'
import { logger } from '../logger.js'
import { matchCase } from '../lib/casing.js'
import { conjugate, detectInflection, isReplaceable } from '../lib/morphology.js'
import { tokenize } from '../lib/text.js'
import { fetchWordData, pickSynonym } from './dictionaryService.js'

/**
 * Replace every replaceable word with a synonym, preserving punctuation,
 * capitalization and inflection. Words are looked up sequentially to avoid
 * flooding the free dictionary API, and the whole run is bounded by a time
 * budget so a slow API can never hang the command.
 */
export const translateText = async (content: string): Promise<string> => {
    const tokens = tokenize(content)
    const output: string[] = []
    const deadline = Date.now() + config.translateBudgetMs

    for (const token of tokens) {
        if (!isReplaceable(token)) {
            output.push(token)
            continue
        }

        // Out of time: keep the remaining words exactly as they were.
        if (Date.now() >= deadline) {
            logger.warn('[translator] time budget exhausted, keeping remaining words as-is')
            output.push(token)
            continue
        }

        const lookupWord = token.toLowerCase()
        const entries = await fetchWordData(lookupWord)
        if (!entries || entries.length === 0) {
            output.push(token)
            continue
        }

        const inflection = detectInflection(token)
        const synonym = pickSynonym(entries, inflection, lookupWord)

        if (synonym) {
            const conjugated = conjugate(synonym, inflection)
            // If conjugation produced the original word, keep the original
            // so the sentence is not changed into itself.
            if (conjugated.toLowerCase() !== lookupWord) {
                output.push(matchCase(token, conjugated))
                continue
            }
        }

        output.push(token)
    }

    return output.join('')
}
