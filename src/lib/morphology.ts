import { IRREGULAR_FORMS } from '../constants/irregularVerbs.js'
import { PROTECTED_WORDS } from '../constants/protectedWords.js'
import type { Inflection } from '../types.js'

export const VOWELS = 'aeiou'

/**
 * A token is replaceable only if it is a purely alphabetic word (allowing
 * internal apostrophes), longer than a single letter, and not protected.
 */
export const isReplaceable = (token: string): boolean => {
    return (
        /^[a-zA-Z]+(?:'[a-zA-Z]+)?$/.test(token) &&
        token.length > 1 &&
        !PROTECTED_WORDS.has(token.toLowerCase())
    )
}

export const endsWithDoubleConsonant = (stem: string): boolean => {
    const last = stem.slice(-1)
    const secondToLast = stem.slice(-2, -1)
    return (
        last === secondToLast &&
        !VOWELS.includes(last) &&
        stem.length >= 2 &&
        last !== 'w' &&
        last !== 'y'
    )
}

/**
 * True for short single-syllable CVC stems ("mak", "run", "stop"), where
 * the final consonant doubles before -ing/-ed or a silent "e" was dropped
 * ("mak" <- "make"). Multi-syllable stems like "visit" or "edit" never
 * double, so anything with more than one vowel is rejected.
 */
export const isSingleSyllableCvc = (stem: string): boolean => {
    if (stem.length < 3 || stem.length > 4) return false

    const vowelIndices: number[] = []
    for (let i = 0; i < stem.length; i++) {
        if (VOWELS.includes(stem[i])) vowelIndices.push(i)
    }
    if (vowelIndices.length !== 1) return false

    const last = stem.slice(-1)
    return (
        vowelIndices[0] >= 1 &&
        vowelIndices[0] <= 2 &&
        !VOWELS.includes(last) &&
        !'wxy'.includes(last)
    )
}

/**
 * Detect the token's grammatical form. Returns null for base-form words or
 * anything the conservative guards cannot classify confidently, since
 * misdetection would mangle the replacement.
 */
export const detectInflection = (token: string): Inflection | null => {
    const word = token.toLowerCase()

    // Gerund / present participle: "doing", "making", "running".
    if (word.length >= 5 && word.endsWith('ing')) {
        const stem = word.slice(0, -3)
        // Doubled consonant ("running" -> "run").
        if (endsWithDoubleConsonant(stem)) {
            return { kind: 'ing', stem: stem.slice(0, -1) }
        }
        // Single-syllable CVC stems come from silent-e verbs ("making" ->
        // "make"). X and W never double ("boxing", "snowing").
        if (isSingleSyllableCvc(stem)) {
            return { kind: 'ing', stem: stem + 'e' }
        }
        if (/[aeiou]/.test(stem) && stem.length >= 2) {
            return { kind: 'ing', stem }
        }
        return null
    }

    // Past tense: "played", "ruined", "stopped", "tried".
    if (word.length >= 5 && word.endsWith('ed')) {
        // Y-conversion ("tried" -> "try").
        if (word.endsWith('ied')) {
            return { kind: 'ed', stem: word.slice(0, -3) + 'y' }
        }
        const stem = word.slice(0, -2)
        // Doubled consonant ("stopped" -> "stop").
        if (endsWithDoubleConsonant(stem)) {
            return { kind: 'ed', stem: stem.slice(0, -1) }
        }
        if (/[aeiou]/.test(stem) && stem.length >= 2) {
            return { kind: 'ed', stem }
        }
        return null
    }

    // Plural or third-person singular: "plays", "boxes", "babies".
    if (word.length >= 4 && word.endsWith('s') && !word.endsWith('ss')) {
        // Y-conversion ("babies" -> "baby").
        if (word.endsWith('ies')) {
            return { kind: 's', stem: word.slice(0, -3) + 'y' }
        }
        // Es-ending after a sibilant ("boxes" -> "box", "catches" -> "catch").
        if (word.endsWith('es') && /(s|x|z|ch|sh)$/.test(word.slice(0, -2))) {
            return { kind: 's', stem: word.slice(0, -2) }
        }
        const stem = word.slice(0, -1)
        if (/[aeiou]/.test(stem) && stem.length >= 2 && !stem.endsWith('s') && !word.endsWith('us')) {
            return { kind: 's', stem }
        }
        return null
    }

    return null
}

/**
 * Re-apply the original word's grammatical form to a base-form synonym.
 */
export const conjugate = (synonym: string, inflection: Inflection | null): string => {
    if (!inflection) return synonym

    const base = synonym.toLowerCase()
    const irregular = IRREGULAR_FORMS[base]

    if (inflection.kind === 'ing') {
        if (irregular) return irregular[1]
        if (base.endsWith('ie')) return `${base.slice(0, -2)}ying`
        if (base.endsWith('e')) return `${base.slice(0, -1)}ing`
        if (isSingleSyllableCvc(base)) return `${base}${base.slice(-1)}ing`
        return `${base}ing`
    }

    if (inflection.kind === 'ed') {
        if (irregular) return irregular[0]
        if (base.endsWith('e')) return `${base}d`
        if (isSingleSyllableCvc(base)) return `${base}${base.slice(-1)}ed`
        if (base.endsWith('y') && !VOWELS.includes(base.charAt(base.length - 2))) {
            return `${base.slice(0, -1)}ied`
        }
        return `${base}ed`
    }

    if (inflection.kind === 's') {
        if (irregular) return irregular[2]
        if (/(s|x|z|ch|sh)$/.test(base)) return `${base}es`
        if (base.endsWith('y') && !VOWELS.includes(base.charAt(base.length - 2))) {
            return `${base.slice(0, -1)}ies`
        }
        return `${base}s`
    }

    return synonym
}
