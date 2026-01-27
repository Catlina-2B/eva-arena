# Change: Update Typography to Use Source Code Pro and Ethnocentric Fonts

## Why
统一应用字体风格，使用 Source Code Pro 作为默认正文字体提供专业的代码风格外观，同时保留 Ethnocentric 用于大标题以突显品牌特色。

## What Changes
- **BREAKING**: 默认正文字体从 Inter 更改为 Source Code Pro
- 添加 Source Code Pro 本地字体加载（使用可变字重版本）
- 更新 Tailwind font-family 配置：
  - `font-sans` 改为 Source Code Pro
  - `font-mono` 改为 Source Code Pro
  - `font-display` 保留 Ethnocentric（用于大标题）
- 更新 globals.css 中的 body 默认字体

## Impact
- Affected specs: typography (新建)
- Affected code:
  - `src/styles/globals.css` - 添加字体加载，更新 body 字体
  - `tailwind.config.js` - 更新 fontFamily 配置

