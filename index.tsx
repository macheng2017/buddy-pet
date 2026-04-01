#!/usr/bin/env bun
/**
 * 愚人节宠物系统独立演示
 * 从 src/buddy/ 提取核心逻辑，无需其他项目依赖
 * 运行: bun buddy-demo.tsx
 */

import React, { useEffect, useState, useCallback } from 'react'
import { render, Box, Text, useInput } from 'ink'

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
  rarity: Rarity
  species: Species
  eye: Eye
  hat: Hat
  shiny: boolean
  stats: Record<StatName, number>
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
  const body = frames[frame % frames.length]!.map(line => line.replaceAll('{E}', bones.eye))
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
  return function () {
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
  for (const rarity of RARITIES) { roll -= RARITY_WEIGHTS[rarity]; if (roll < 0) return rarity }
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

const PERSONALITIES = [
  '喜欢在深夜调试代码，对分号有执念', '把所有问题都归咎于缓存', '坚信注释比代码重要',
  '每次提交都写"fix bug"', '对黑暗模式有着宗教般的热情', '把 README 当成人生哲学',
  '相信递归能解决一切', '对未使用变量有奇怪的感情', '总是把 TODO 留给下一个人',
  '把 console.log 当作调试的终极武器',
]

function generateCompanion(seed: string): Companion {
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
    personality: pick(rng, PERSONALITIES),
  }
}

// ─── 动画常量 ──────────────────────────────────────────────────────────────

const TICK_MS = 500
const IDLE_SEQUENCE = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0]
const PET_HEARTS = [
  '   ♥    ♥   ', '  ♥  ♥   ♥  ', ' ♥   ♥  ♥   ', '♥  ♥      ♥ ', '·    ·   ·  ',
]

// ─── 主界面 ────────────────────────────────────────────────────────────────

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

function App() {
  const [seed, setSeed] = useState(() => String(Date.now()))
  const [companion, setCompanion] = useState(() => generateCompanion(String(Date.now())))
  const [tick, setTick] = useState(0)
  const [petTick, setPetTick] = useState<number | null>(null)
  const [bubble, setBubble] = useState<string | null>(null)
  const [bubbleTick, setBubbleTick] = useState(0)
  const [showStats, setShowStats] = useState(false)
  const [speciesIndex, setSpeciesIndex] = useState(-1) // -1 = random

  const QUIPS = [
    `喵~ 别看我，我在思考`, `${renderFace(companion)} ...`, `今天的 bug 是你的错`,
    `我只是在摸鱼`, `需要帮忙吗？（不需要）`, `已读不回`, `正在充电中...`,
    `❤ ❤ ❤`, `我比你想象的更努力`, `你好，陌生人`,
  ]

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), TICK_MS)
    return () => clearInterval(t)
  }, [])

  const reroll = useCallback(() => {
    const newSeed = String(Date.now())
    setSeed(newSeed)
    setCompanion(generateCompanion(newSeed))
    setSpeciesIndex(-1)
    setBubble('新朋友！')
    setBubbleTick(tick)
  }, [tick])

  const pet = useCallback(() => {
    setPetTick(tick)
    setBubble(QUIPS[Math.floor(Math.random() * QUIPS.length)]!)
    setBubbleTick(tick)
  }, [tick, companion])

  const nextSpecies = useCallback(() => {
    const next = (speciesIndex + 1) % ALL_SPECIES.length
    setSpeciesIndex(next)
    const newSeed = seed + ALL_SPECIES[next]
    setCompanion({ ...generateCompanion(newSeed), species: ALL_SPECIES[next]! })
  }, [speciesIndex, seed])

  useInput((input, key) => {
    if (input === 'p') pet()
    if (input === 'r') reroll()
    if (input === 'n') nextSpecies()
    if (input === 's') setShowStats(v => !v)
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

  // 气泡消失逻辑
  const bubbleAge = bubble ? tick - bubbleTick : 0
  const BUBBLE_SHOW = 12
  const fading = bubbleAge >= BUBBLE_SHOW - 4
  if (bubble && bubbleAge >= BUBBLE_SHOW) {
    setTimeout(() => setBubble(null), 0)
  }

  const color = RARITY_COLORS[companion.rarity]
  const shinyPrefix = companion.shiny ? '✨ ' : ''

  return (
    <Box flexDirection="column" padding={1}>
      {/* 标题 */}
      <Box marginBottom={1}>
        <Text bold color="yellow">🐾 愚人节宠物系统  </Text>
        <Text dimColor>SALT: friend-2026-401</Text>
      </Box>

      <Box flexDirection="row" gap={4}>
        {/* 左：精灵 + 名字 */}
        <Box flexDirection="column" alignItems="center" width={20}>
          {sprite.map((line, i) => (
            <Text key={`sprite-${i}`} color={i === 0 && heartFrame ? 'red' : color}>
              {line}
            </Text>
          ))}
          <Text bold color={color}>{shinyPrefix}{companion.name}</Text>
          <Text color={color}>{RARITY_STARS[companion.rarity]}</Text>
          <Text dimColor italic>{companion.species}</Text>
        </Box>

        {/* 中：气泡 + 信息 */}
        <Box flexDirection="column" width={36}>
          {bubble ? (
            <Box
              borderStyle="round"
              borderColor={fading ? 'gray' : color}
              paddingX={1}
              marginBottom={1}
              width={32}
            >
              <Text italic dimColor={fading} color={fading ? 'gray' : undefined}>
                {bubble}
              </Text>
            </Box>
          ) : (
            <Box marginBottom={1} height={3} />
          )}

          <Box flexDirection="column" gap={0}>
            <Text>
              <Text dimColor>稀有度  </Text>
              <Text bold color={color}>{companion.rarity.toUpperCase()}</Text>
              {companion.shiny && <Text color="yellow">  ✨ SHINY</Text>}
            </Text>
            <Text>
              <Text dimColor>眼睛    </Text>
              <Text>{companion.eye}</Text>
            </Text>
            {companion.hat !== 'none' && (
              <Text>
                <Text dimColor>帽子    </Text>
                <Text>{companion.hat}</Text>
              </Text>
            )}
            <Text>
              <Text dimColor>性格    </Text>
              <Text italic>{companion.personality}</Text>
            </Text>
          </Box>

          {showStats && (
            <Box flexDirection="column" marginTop={1}>
              <Text bold dimColor>── 属性 ──</Text>
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

      {/* 底部操作提示 */}
      <Box marginTop={1}>
        <Text dimColor>
          [<Text color="cyan">p</Text>] 摸一摸
          [<Text color="cyan">r</Text>] 重新抽
          [<Text color="cyan">n</Text>] 下一种({speciesIndex === -1 ? 'rand' : ALL_SPECIES[speciesIndex]})
          [<Text color="cyan">s</Text>] 属性
          [<Text color="cyan">q</Text>] 退出
        </Text>
      </Box>
    </Box>
  )
}

render(<App />)
