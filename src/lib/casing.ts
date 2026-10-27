/**
 * Mirror the capitalization of the original word onto the synonym so the
 * replacement fits the sentence's presentation.
 */
export const matchCase = (originalWord: string, synonym: string): string => {
    if (originalWord === originalWord.toUpperCase()) return synonym.toUpperCase()

    if (
        originalWord.charAt(0) === originalWord.charAt(0).toUpperCase() &&
        originalWord.slice(1) === originalWord.slice(1).toLowerCase()
    ) {
        return synonym.charAt(0).toUpperCase() + synonym.slice(1).toLowerCase()
    }

    return synonym.toLowerCase()
}
