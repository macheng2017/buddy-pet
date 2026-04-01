# 🐾 Buddy Pet

一个运行在终端里的宠物养成小游戏，从 Claude Code 源码中的愚人节彩蛋提取而来。

每次启动随机抽一只小动物陪你写代码，有 18 种物种、5 级稀有度、1% 概率出 ✨ SHINY。

```
        /^\
       (\__/)
      ( @  @ )
     =(  ..  )=
      (")__(")
        Zigzag        稀有度  RARE
         ★★★          眼睛    @
        rabbit        帽子    wizard
                      性格    相信递归能解决一切
```

## 安装

需要 Node.js 或 Bun 运行环境。

```bash
# 克隆项目
git clone https://github.com/macheng2017/buddy-pet
cd buddy-pet

# 安装依赖
npm install
# 或
bun install
```

## 运行

```bash
# 使用 npm
npm start

# 使用 bun
bun index.tsx
```

## 操作

| 按键 | 动作 |
|------|------|
| `p` | 摸一摸，冒爱心，宠物会说话 |
| `r` | 重新抽一只 |
| `n` | 按顺序翻看全部 18 种动物 |
| `s` | 显示/隐藏五维属性 |
| `q` | 退出 |

## 宠物属性

每只宠物有五维属性，由 userId 哈希确定性生成：

- **DEBUGGING** 调试力
- **PATIENCE** 耐心
- **CHAOS** 混乱值
- **WISDOM** 智慧
- **SNARK** 毒舌度

## 稀有度

| 稀有度 | 概率 |
|--------|------|
| ★ Common | 60% |
| ★★ Uncommon | 25% |
| ★★★ Rare | 10% |
| ★★★★ Epic | 4% |
| ★★★★★ Legendary | 1% |

SHINY 概率：1%

## 18 种动物

duck · goose · blob · cat · dragon · octopus · owl · penguin · turtle · snail · ghost · axolotl · capybara · cactus · robot · rabbit · mushroom · chonk

## 背景

这个宠物系统原本藏在 Claude Code（Anthropic 官方 CLI 工具）的源码里，被 `feature('BUDDY')` 开关锁住，永远不会出现在用户面前。盐值 `friend-2026-401` 暗示它是为 2026 年 4 月 1 日愚人节准备的彩蛋。
