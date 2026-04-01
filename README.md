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

> **⚠️ Disclaimer / 免责声明**
>
> This project has **no affiliation with any cryptocurrency, meme coin, or token** — including $PUDDING or any other token on Pump.fun or similar platforms.
>
> I did not create, launch, endorse, or benefit from any token associated with this project. Any claims that creator fees, rewards, or proceeds are being redirected to this repository or its author are **false and made without my knowledge or consent**. I am not responsible for any financial activity carried out under this project's name.
>
> If you are considering purchasing any such token, please be aware: **it has no connection to this project, and I receive nothing from it.**
>
> ---
>
> 本项目与任何加密货币、Meme 币或代币**没有任何关联**，包括 Pump.fun 或其他平台上的 $PUDDING 及同类代币。
>
> 我没有创建、发行、背书任何相关代币，也未从中获益。任何声称"创作者收益已重定向至本仓库或作者"的说法均属**虚假信息，系他人在未经我知情或同意的情况下发起的行为**，我对以本项目名义开展的任何金融活动不承担任何责任。
>
> 如果你正在考虑购买此类代币，请注意：**它与本项目毫无关系，我从中分文未得。**

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
