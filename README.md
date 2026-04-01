# 🐾 Buddy Pet

A terminal pet companion extracted from a hidden April Fools' easter egg buried deep in Claude Code's source code — unlocked by reverse-engineering, not by Anthropic.

一个从 Claude Code 反编译源码中挖出的愚人节彩蛋，在终端里养一只陪你写代码的小动物。

```
        /^\
       (\__/)
      ( @  @ )
     =(  ..  )=
      (")__(")
        Zigzag        Rarity  RARE
         ★★★          Eye     @
        rabbit        Hat     wizard
                      Bio     Believes recursion solves everything
```

---

## The Story

Someone reverse-engineered Claude Code (Anthropic's official CLI tool) and found this pet system hidden in `src/buddy/` — fully implemented, never shipped.

The code has a date check:

```typescript
export function isBuddyTeaserWindow(): boolean {
  const d = new Date()
  return d.getFullYear() === 2026 && d.getMonth() === 3 && d.getDate() <= 7
}
```

Today is April 1, 2026. That function returns `true` for the first time.

But there's another lock:

```typescript
if (!feature('BUDDY')) return  // always false in external builds
```

`feature()` is hardcoded to return `false` in all public releases. The date logic never runs. The salt `friend-2026-401` tells you exactly when this was meant to go live — but only for Anthropic employees.

This project extracts that hidden system and lets anyone run it.

---

## Install

Requires Node.js or Bun.

```bash
git clone https://github.com/macheng2017/buddy-pet
cd buddy-pet

npm install
# or
bun install
```

## Run

```bash
npm start
# or
bun index.tsx
```

## Controls

| Key | Action |
|-----|--------|
| `p` | Pet it — hearts float up, it says something |
| `r` | Reroll a new companion |
| `n` | Cycle through all 18 species |
| `s` | Toggle stats panel |
| `q` | Quit |

## Stats

Each companion has 5 stats deterministically generated from a hash of the current timestamp:

- **DEBUGGING** — how good it is at finding bugs
- **PATIENCE** — self-explanatory
- **CHAOS** — unpredictability index
- **WISDOM** — ancient knowledge
- **SNARK** — attitude level

## Rarity

| Rarity | Chance |
|--------|--------|
| ★ Common | 60% |
| ★★ Uncommon | 25% |
| ★★★ Rare | 10% |
| ★★★★ Epic | 4% |
| ★★★★★ Legendary | 1% |

✨ SHINY chance: 1%

## Species (18 total)

duck · goose · blob · cat · dragon · octopus · owl · penguin · turtle · snail · ghost · axolotl · capybara · cactus · robot · rabbit · mushroom · chonk

---

## 背景

这个宠物系统完整地藏在 Claude Code（Anthropic 官方 CLI 工具）的反编译源码里，被 `feature('BUDDY')` 开关锁住，从未出现在任何用户面前。

盐值 `friend-2026-401` 暗示它是为 2026 年 4 月 1 日准备的愚人节彩蛋。代码里写了完整的日期解锁逻辑，但入口处的 `feature()` 永远返回 `false`，日期判断根本执行不到。

这个彩蛋只为 Anthropic 内部员工解锁。我们把它挖出来了。
