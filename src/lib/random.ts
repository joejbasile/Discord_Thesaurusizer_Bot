export const getRandomInt = (max: number): number => {
    if (max <= 0) return 0
    return Math.floor(Math.random() * max)
}

export const pickRandom = <T>(items: readonly T[]): T | undefined => {
    if (items.length === 0) return undefined
    return items[getRandomInt(items.length)]
}
