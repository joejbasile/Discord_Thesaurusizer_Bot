/**
 * Words that must never be replaced: pronouns, articles, prepositions,
 * conjunctions, auxiliaries, negations, degree adverbs, interjections and
 * common contractions. Swapping any of these destroys the sentence's
 * grammar and flow.
 */
export const PROTECTED_WORDS = new Set<string>([
    // Pronouns
    'i', 'me', 'my', 'mine', 'myself',
    'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself',
    'we', 'us', 'our', 'ours', 'ourselves',
    'they', 'them', 'their', 'theirs', 'themselves',
    'this', 'that', 'these', 'those',
    'who', 'whom', 'whose', 'what', 'which',
    'there', 'here',
    'someone', 'somebody', 'something',
    'anyone', 'anybody', 'anything',
    'everyone', 'everybody', 'everything',
    'no-one', 'nobody', 'nothing',

    // Articles / determiners
    'a', 'an', 'the', 'some', 'any', 'no',
    'each', 'every', 'all', 'both', 'few', 'several',
    'either', 'neither', 'another', 'other',

    // Conjunctions / subordinators
    'and', 'or', 'but', 'nor', 'so', 'yet',
    'if', 'because', 'while', 'than', 'whether',
    'though', 'although', 'unless', 'until', 'since',
    'as', 'when', 'where', 'why', 'how',

    // Prepositions
    'in', 'on', 'at', 'to', 'of', 'by', 'for', 'with',
    'from', 'into', 'onto', 'over', 'under',
    'up', 'down', 'out', 'off', 'about',
    'after', 'before', 'between', 'through',
    'against', 'without', 'within', 'upon',
    'near', 'behind', 'beyond', 'toward', 'towards',
    'around', 'across', 'along', 'during', 'except',

    // Auxiliaries / glue verbs
    'is', 'am', 'are', 'was', 'were',
    'be', 'been', 'being',
    'do', 'does', 'did', 'done',
    'have', 'has', 'had', 'having',
    'will', 'would', 'shall', 'should',
    'can', 'could', 'may', 'might', 'must',
    'get', 'got', 'gets', 'let', 'lets',

    // Negation / degree
    'not', 'never', 'very', 'just', 'only', 'too',
    'really', 'pretty', 'quite', 'such',
    'still', 'again', 'always', 'even', 'ever',
    'better', 'worse', 'best', 'worst',

    // Singular nouns that already end in "ies"; the plural-detection
    // heuristic cannot distinguish them from "babies"-style plurals.
    'series', 'species',

    // Interjections / discourse markers
    'okay', 'ok', 'hey', 'hi', 'hello', 'wow',
    'lol', 'lmao', 'please', 'thanks', 'thank',
    'sorry', 'yeah', 'yes', 'well', 'like',

    // Common contractions (with and without apostrophes)
    "don't", "can't", "won't", "isn't", "aren't",
    "didn't", "doesn't", "wasn't", "weren't",
    "couldn't", "shouldn't", "wouldn't", "ain't",
    "i'm", "i've", "i'll", "i'd",
    "you're", "you've", "you'll", "you'd",
    "he's", "she's", "it's", "that's", "there's",
    "we're", "we've", "we'll", "we'd",
    "they're", "they've", "they'll", "they'd",
    "who's", "what's", "where's", "when's", "why's", "how's", "let's",
    'im', 'ur', 'u', 'ive', 'ill', 'id',
    'dont', 'cant', 'wont', 'isnt', 'arent',
    'didnt', 'doesnt', 'wasnt', 'werent',
    'couldnt', 'shouldnt', 'wouldnt', 'aint',
    'ive', 'youre', 'youve', 'hes', 'shes',
    'its', 'thats', 'theres', 'were', 'theyre',
    'theyve', 'theyll', 'gonna', 'wanna', 'gotta'
])
