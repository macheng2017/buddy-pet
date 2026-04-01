#!/usr/bin/env bun
/**
 * Buddy Pet — April Fools' easter egg extracted from Claude Code
 * Run: npm start / bun index.tsx
 * Lang: auto-detected from system locale, override with --lang=zh or --lang=en
 */

import React, { useEffect, useState, useCallback } from 'react'
import { render, Box, Text, useInput } from 'ink'

// ─── i18n ──────────────────────────────────────────────────────────────────

type Lang = 'en' | 'zh'


const T = {
  en: {
    title: '🐾 Buddy Pet',
    rarity: 'Rarity  ',
    eye: 'Eye     ',
    hat: 'Hat     ',
    bio: 'Bio     ',
    stats: '── Stats ──',
    pet: 'pet',
    reroll: 'reroll',
    next: 'next',
    statsToggle: 'stats',
    quit: 'quit',
    newFriend: 'New friend!',
    langSwitch: 'zh',
    quips: [
      "Don't look at me, I'm thinking",
      "Today's bug is your fault",
      "Just vibing",
      "Need help? (No)",
      "On read",
      "Charging...",
      "❤ ❤ ❤",
      "I work harder than you think",
      "Hello, stranger",
    ],
    personalities: [
      'Debugs at 3am, obsessed with semicolons',
      'Blames everything on the cache',
      'Believes comments matter more than code',
      'Every commit message says "fix bug"',
      'Has religious devotion to dark mode',
      'Treats the README as life philosophy',
      'Believes recursion solves everything',
      'Has strange feelings about unused variables',
      'Always leaves TODOs for the next person',
      'Uses console.log as the ultimate debugger',
    ],
  },
  zh: {
    title: '🐾 愚人节宠物',
    rarity: '稀有度  ',
    eye: '眼睛    ',
    hat: '帽子    ',
    bio: '性格    ',
    stats: '── 属性 ──',
    pet: '摸一摸',
    reroll: '重新抽',
    next: '下一种',
    statsToggle: '属性',
    quit: '退出',
    newFriend: '新朋友！',
    langSwitch: 'en',
    quips: [
      '别看我，我在思考',
      '今天的 bug 是你的错',
      '我只是在摸鱼',
      '需要帮忙吗？（不需要）',
      '已读不回',
      '正在充电中...',
      '❤ ❤ ❤',
      '我比你想象的更努力',
      '你好，陌生人',
    ],
    personalities: [
      '喜欢在深夜调试代码，对分号有执念',
      '把所有问题都归咎于缓存',
      '坚信注释比代码重要',
      '每次提交都写"fix bug"',
      '对黑暗模式有着宗教般的热情',
      '把 README 当成人生哲学',
      '相信递归能解决一切',
      '对未使用变量有奇怪的感情',
      '总是把 TODO 留给下一个人',
      '把 console.log 当作调试的终极武器',
    ],
  },
}

// ─── 类型定义 ──────────────────────────────────────────────────────────────

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const
type Rarity = (typeof RARITIES)[number]

const EYES = ['·', '✦', '×', '◉', '@', '°'] as const
type Eye = (typeof EYES)[number]

const HATS = ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck'] as const
type Hat = (typeof HATS)[number]

const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'] as const
type StatName = (typeof STAT_NAMES)[number]

type Species =
  | 'duck' | 'goose' | 'blob' | 'cat' | 'dragon' | 'octopus'
  | 'owl' | 'penguin' | 'turtle' | 'snail' | 'ghost' | 'axolotl'
  | 'capybara' | 'cactus' | 'robot' | 'rabbit' | 'mushroom' | 'chonk'

const ALL_SPECIES: Species[] = [
  'duck', 'goose', 'blob', 'cat', 'dragon', 'octopus',
  'owl', 'penguin', 'turtle', 'snail', 'ghost', 'axolotl',
  'capybara', 'cactus', 'robot', 'rabbit', 'mushroom', 'chonk',
]

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1,
}

const RARITY_STARS: Record<Rarity, string> = {
  common: '★', uncommon: '★★', rare: '★★★', epic: '★★★★', legendary: '★★★★★',
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'gray', uncommon: 'green', rare: 'blue', epic: 'magenta', legendary: 'yellow',
}

type CompanionBones = {
  rarity: Rarity; species: Species; eye: Eye; hat: Hat
  shiny: boolean; stats: Record<StatName, number>
}

type Companion = CompanionBones & { name: string; personality: string }

// ─── ASCII 精灵图 ──────────────────────────────────────────────────────────

const BODIES: Record<Species, string[][]> = {
  duck: [
    ['            ', '    __      ', '  <({E} )___  ', '   (  ._>   ', '    `--´    '],
    ['            ', '    __      ', '  <({E} )___  ', '   (  ._>   ', '    `--´~   '],
    ['            ', '    __      ', '  <({E} )___  ', '   (  .__>  ', '    `--´    '],
  ],
  goose: [
    ['            ', '     ({E}>    ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
    ['            ', '    ({E}>     ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
    ['            ', '     ({E}>>   ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
  ],
  blob: [
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (      )  ', '   `----´   '],
    ['            ', '  .------.  ', ' (  {E}  {E}  ) ', ' (        ) ', '  `------´  '],
    ['            ', '    .--.    ', '   ({E}  {E})   ', '   (    )   ', '    `--´    '],
  ],
  cat: [
    ['            ', '   /\\_/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")   '],
    ['            ', '   /\\_/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")~  '],
    ['            ', '   /\\-/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")   '],
  ],
  dragon: [
    ['            ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (   ~~   ) ', '  `-vvvv-´  '],
    ['            ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (        ) ', '  `-vvvv-´  '],
    ['   ~    ~   ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (   ~~   ) ', '  `-vvvv-´  '],
  ],
  octopus: [
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  /\\/\\/\\/\\  '],
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  \\/\\/\\/\\/  '],
    ['     o      ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  /\\/\\/\\/\\  '],
  ],
  owl: [
    ['            ', '   /\\  /\\   ', '  (({E})({E}))  ', '  (  ><  )  ', '   `----´   '],
    ['            ', '   /\\  /\\   ', '  (({E})({E}))  ', '  (  ><  )  ', '   .----.   '],
    ['            ', '   /\\  /\\   ', '  (({E})(-))  ', '  (  ><  )  ', '   `----´   '],
  ],
  penguin: [
    ['            ', '  .---.     ', '  ({E}>{E})     ', ' /(   )\\    ', '  `---´     '],
    ['            ', '  .---.     ', '  ({E}>{E})     ', ' |(   )|    ', '  `---´     '],
    ['  .---.     ', '  ({E}>{E})     ', ' /(   )\\    ', '  `---´     ', '   ~ ~      '],
  ],
  turtle: [
    ['            ', '   _,--._   ', '  ( {E}  {E} )  ', ' /[______]\\ ', '  ``    ``  '],
    ['            ', '   _,--._   ', '  ( {E}  {E} )  ', ' /[______]\\ ', '   ``  ``   '],
    ['            ', '   _,--._   ', '  ( {E}  {E} )  ', ' /[======]\\ ', '  ``    ``  '],
  ],
  snail: [
    ['            ', ' {E}    .--.  ', '  \\  ( @ )  ', '   \\_`--´   ', '  ~~~~~~~   '],
    ['            ', '  {E}   .--.  ', '  |  ( @ )  ', '   \\_`--´   ', '  ~~~~~~~   '],
    ['            ', ' {E}    .--.  ', '  \\  ( @  ) ', '   \\_`--´   ', '   ~~~~~~   '],
  ],
  ghost: [
    ['            ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  ~`~``~`~  '],
    ['            ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  `~`~~`~`  '],
    ['    ~  ~    ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  ~~`~~`~~  '],
  ],
  axolotl: [
    ['            ', '}~(______)~{', '}~({E} .. {E})~{', '  ( .--. )  ', '  (_/  \\_)  '],
    ['            ', '~}(______){~', '~}({E} .. {E}){~', '  ( .--. )  ', '  (_/  \\_)  '],
    ['            ', '}~(______)~{', '}~({E} .. {E})~{', '  (  --  )  ', '  ~_/  \\_~  '],
  ],
  capybara: [
    ['            ', '  n______n  ', ' ( {E}    {E} ) ', ' (   oo   ) ', '  `------´  '],
    ['            ', '  n______n  ', ' ( {E}    {E} ) ', ' (   Oo   ) ', '  `------´  '],
    ['    ~  ~    ', '  u______n  ', ' ( {E}    {E} ) ', ' (   oo   ) ', '  `------´  '],
  ],
  cactus: [
    ['            ', ' n  ____  n ', ' | |{E}  {E}| | ', ' |_|    |_| ', '   |    |   '],
    ['            ', '    ____    ', ' n |{E}  {E}| n ', ' |_|    |_| ', '   |    |   '],
    [' n        n ', ' |  ____  | ', ' | |{E}  {E}| | ', ' |_|    |_| ', '   |    |   '],
  ],
  robot: [
    ['            ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ ==== ]  ', '  `------´  '],
    ['            ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ -==- ]  ', '  `------´  '],
    ['     *      ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ ==== ]  ', '  `------´  '],
  ],
  rabbit: [
    ['            ', '   (\\__/)   ', '  ( {E}  {E} )  ', ' =(  ..  )= ', '  (")__(")  '],
    ['            ', '   (|__/)   ', '  ( {E}  {E} )  ', ' =(  ..  )= ', '  (")__(")  '],
    ['            ', '   (\\__/)   ', '  ( {E}  {E} )  ', ' =( .  . )= ', '  (")__(")  '],
  ],
  mushroom: [
    ['            ', ' .-o-OO-o-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
    ['            ', ' .-O-oo-O-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
    ['   . o  .   ', ' .-o-OO-o-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
  ],
  chonk: [
    ['            ', '  /\\    /\\  ', ' ( {E}    {E} ) ', ' (   ..   ) ', '  `------´  '],
    ['            ', '  /\\    /|  ', ' ( {E}    {E} ) ', ' (   ..   ) ', '  `------´  '],
    ['            ', '  /\\    /\\  ', ' ( {E}    {E} ) ', ' (   ..   ) ', '  `------´~ '],
  ],
}

const HAT_LINES: Record<Hat, string> = {
  none: '', crown: '   \\^^^/    ', tophat: '   [___]    ',
  propeller: '    -+-     ', halo: '   (   )    ', wizard: '    /^\\     ',
  beanie: '   (___)    ', tinyduck: '    ,>      ',
}

function renderSprite(bones: CompanionBones, frame = 0): string[] {
  const frames = BODIES[bones.species]
  const body = frames[frame % frames.length]!.map(l => l.replaceAll('{E}', bones.eye))
  const lines = [...body]
  if (bones.hat !== 'none' && !lines[0]!.trim()) lines[0] = HAT_LINES[bones.hat]
  if (!lines[0]!.trim() && frames.every(f => !f[0]!.trim())) lines.shift()
  return lines
}

function renderFace(bones: CompanionBones): string {
  const e = bones.eye
  switch (bones.species) {
    case 'duck': case 'goose': return `(${e}>`
    case 'blob': return `(${e}${e})`
    case 'cat': return `=${e}ω${e}=`
    case 'dragon': return `<${e}~${e}>`
    case 'octopus': return `~(${e}${e})~`
    case 'owl': return `(${e})(${e})`
    case 'penguin': return `(${e}>)`
    case 'turtle': return `[${e}_${e}]`
    case 'snail': return `${e}(@)`
    case 'ghost': return `/${e}${e}\\`
    case 'axolotl': return `}${e}.${e}{`
    case 'capybara': return `(${e}oo${e})`
    case 'cactus': return `|${e}  ${e}|`
    case 'robot': return `[${e}${e}]`
    case 'rabbit': return `(${e}..${e})`
    case 'mushroom': return `|${e}  ${e}|`
    case 'chonk': return `(${e}.${e})`
  }
}

// ─── 宠物生成逻辑 ──────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

function rollRarity(rng: () => number): Rarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (const r of RARITIES) { roll -= RARITY_WEIGHTS[r]; if (roll < 0) return r }
  return 'common'
}

const RARITY_FLOOR: Record<Rarity, number> = { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50 }

function rollStats(rng: () => number, rarity: Rarity): Record<StatName, number> {
  const floor = RARITY_FLOOR[rarity]
  const peak = pick(rng, STAT_NAMES)
  let dump = pick(rng, STAT_NAMES)
  while (dump === peak) dump = pick(rng, STAT_NAMES)
  const stats = {} as Record<StatName, number>
  for (const name of STAT_NAMES) {
    if (name === peak) stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30))
    else if (name === dump) stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15))
    else stats[name] = floor + Math.floor(rng() * 40)
  }
  return stats
}

const PET_NAMES = [
  'Mochi', 'Biscuit', 'Pixel', 'Nugget', 'Waffle', 'Sprout', 'Glitch',
  'Boba', 'Dumpling', 'Tofu', 'Cosmo', 'Pickle', 'Noodle', 'Wobble',
  'Fizz', 'Pudding', 'Ramen', 'Zigzag', 'Pebble', 'Squid',
]

function generateCompanion(seed: string, lang: Lang): Companion {
  const rng = mulberry32(hashString(seed + 'friend-2026-401'))
  const rarity = rollRarity(rng)
  return {
    rarity,
    species: pick(rng, ALL_SPECIES),
    eye: pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : pick(rng, HATS),
    shiny: rng() < 0.01,
    stats: rollStats(rng, rarity),
    name: pick(rng, PET_NAMES),
    personality: pick(rng, T[lang].personalities),
  }
}

// ─── 动画常量 ──────────────────────────────────────────────────────────────

const TICK_MS = 500
const IDLE_SEQUENCE = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0]
const PET_HEARTS = [
  '   ♥    ♥   ', '  ♥  ♥   ♥  ', ' ♥   ♥  ♥   ', '♥  ♥      ♥ ', '·    ·   ·  ',
]

// ─── 属性条 ────────────────────────────────────────────────────────────────

function StatBar({ value, color }: { value: number; color: string }) {
  const filled = Math.round(value / 10)
  return (
    <Text>
      <Text color={color}>{'█'.repeat(filled)}</Text>
      <Text color="gray">{'░'.repeat(10 - filled)}</Text>
      <Text color="white"> {String(value).padStart(3)}</Text>
    </Text>
  )
}

// ─── 主界面 ────────────────────────────────────────────────────────────────

function App() {
  const [lang, setLang] = useState<Lang>('en')
  const t = T[lang]

  const [seed, setSeed] = useState(() => String(Date.now()))
  const [companion, setCompanion] = useState(() => generateCompanion(String(Date.now()), 'en'))
  const [tick, setTick] = useState(0)
  const [petTick, setPetTick] = useState<number | null>(null)
  const [bubble, setBubble] = useState<string | null>(null)
  const [bubbleTick, setBubbleTick] = useState(0)
  const [showStats, setShowStats] = useState(false)
  const [speciesIndex, setSpeciesIndex] = useState(-1)

  useEffect(() => {
    const timer = setInterval(() => setTick(n => n + 1), TICK_MS)
    return () => clearInterval(timer)
  }, [])

  const reroll = useCallback(() => {
    const newSeed = String(Date.now())
    setSeed(newSeed)
    setCompanion(generateCompanion(newSeed, lang))
    setSpeciesIndex(-1)
    setBubble(t.newFriend)
    setBubbleTick(tick)
  }, [tick, lang, t])

  const pet = useCallback(() => {
    const quips = [...t.quips, `${renderFace(companion)} ...`]
    setPetTick(tick)
    setBubble(quips[Math.floor(Math.random() * quips.length)]!)
    setBubbleTick(tick)
  }, [tick, companion, t])

  const nextSpecies = useCallback(() => {
    const next = (speciesIndex + 1) % ALL_SPECIES.length
    setSpeciesIndex(next)
    setCompanion({ ...generateCompanion(seed + ALL_SPECIES[next], lang), species: ALL_SPECIES[next]! })
  }, [speciesIndex, seed, lang])

  const switchLang = useCallback(() => {
    const next: Lang = lang === 'en' ? 'zh' : 'en'
    setLang(next)
    setCompanion(c => ({ ...c, personality: pick(() => Math.random(), T[next].personalities) }))
  }, [lang])

  useInput((input, key) => {
    if (input === 'p') pet()
    if (input === 'r') reroll()
    if (input === 'n') nextSpecies()
    if (input === 's') setShowStats(v => !v)
    if (input === 'l') switchLang()
    if (input === '1') { setLang('en'); setCompanion(c => ({ ...c, personality: pick(() => Math.random(), T.en.personalities) })) }
    if (input === '2') { setLang('zh'); setCompanion(c => ({ ...c, personality: pick(() => Math.random(), T.zh.personalities) })) }
    if (key.escape || input === 'q') process.exit(0)
  })

  // 动画帧
  const frameCount = BODIES[companion.species].length
  const petAge = petTick !== null ? tick - petTick : Infinity
  const petting = petAge * TICK_MS < PET_HEARTS.length * TICK_MS * 2

  let spriteFrame: number
  let blink = false
  if (bubble || petting) {
    spriteFrame = tick % frameCount
  } else {
    const step = IDLE_SEQUENCE[tick % IDLE_SEQUENCE.length]!
    if (step === -1) { spriteFrame = 0; blink = true }
    else spriteFrame = step % frameCount
  }

  const body = renderSprite(companion, spriteFrame).map(line =>
    blink ? line.replaceAll(companion.eye, '-') : line
  )
  const heartFrame = petting ? PET_HEARTS[Math.min(petAge, PET_HEARTS.length - 1)] : null
  const sprite = heartFrame ? [heartFrame, ...body] : body

  const bubbleAge = bubble ? tick - bubbleTick : 0
  const BUBBLE_SHOW = 12
  const fading = bubbleAge >= BUBBLE_SHOW - 4
  if (bubble && bubbleAge >= BUBBLE_SHOW) setTimeout(() => setBubble(null), 0)

  const color = RARITY_COLORS[companion.rarity]

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} justifyContent="space-between">
        <Text bold color="yellow">{t.title}  </Text>
        <Box>
          <Text
            bold={lang === 'en'}
            inverse={lang === 'en'}
            color="cyan"
            onClick={() => setLang('en')}
          > EN </Text>
          <Text> </Text>
          <Text
            bold={lang === 'zh'}
            inverse={lang === 'zh'}
            color="cyan"
            onClick={() => setLang('zh')}
          > 中文 </Text>
        </Box>
      </Box>

      <Box flexDirection="row">
        {/* 精灵 */}
        <Box flexDirection="column" alignItems="center" width={20}>
          {sprite.map((line, i) => (
            <Text key={`sprite-${i}`} color={i === 0 && heartFrame ? 'red' : color}>{line}</Text>
          ))}
          <Text bold color={color}>{companion.shiny ? '✨ ' : ''}{companion.name}</Text>
          <Text color={color}>{RARITY_STARS[companion.rarity]}</Text>
          <Text dimColor italic>{companion.species}</Text>
        </Box>

        {/* 信息 */}
        <Box flexDirection="column" width={36} marginLeft={2}>
          {bubble ? (
            <Box borderStyle="round" borderColor={fading ? 'gray' : color} paddingX={1} marginBottom={1} width={32}>
              <Text italic dimColor={fading} color={fading ? 'gray' : undefined}>{bubble}</Text>
            </Box>
          ) : (
            <Box marginBottom={1} height={3} />
          )}

          <Text><Text dimColor>{t.rarity}</Text><Text bold color={color}>{companion.rarity.toUpperCase()}</Text>{companion.shiny && <Text color="yellow">  ✨ SHINY</Text>}</Text>
          <Text><Text dimColor>{t.eye}</Text><Text>{companion.eye}</Text></Text>
          {companion.hat !== 'none' && <Text><Text dimColor>{t.hat}</Text><Text>{companion.hat}</Text></Text>}
          <Text><Text dimColor>{t.bio}</Text><Text italic>{companion.personality}</Text></Text>

          {showStats && (
            <Box flexDirection="column" marginTop={1}>
              <Text bold dimColor>{t.stats}</Text>
              {STAT_NAMES.map(name => (
                <Box key={`stat-${name}`}>
                  <Text color="gray">{name.padEnd(10)}</Text>
                  <StatBar value={companion.stats[name]} color={color} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>
          [<Text color="cyan">p</Text>] {t.pet}
          {'  '}[<Text color="cyan">r</Text>] {t.reroll}
          {'  '}[<Text color="cyan">n</Text>] {t.next}({speciesIndex === -1 ? 'rand' : ALL_SPECIES[speciesIndex]})
          {'  '}[<Text color="cyan">s</Text>] {t.statsToggle}
            {'  '}[<Text color="cyan">q</Text>] {t.quit}
        </Text>
      </Box>
    </Box>
  )
}

render(<App />)
