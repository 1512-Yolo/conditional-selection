# 快速开始

## 安装依赖

```bash
npm install
```

## 启动示例项目

```bash
npm run dev
```

## 基本用法

```tsx
import { ConditionalSelection } from '../packages/ConditionalSelection';

<ConditionalSelection
  conditionalRules={rules}
  maxDeep={3}
  disabled={false}
  onChange={setRules}
  renderConditionRules={(item, change) => (
    <FlexSelect item={item} onChange={val => change(val)} />
  )}
/>
```

更多用法详见主目录 README.md。
