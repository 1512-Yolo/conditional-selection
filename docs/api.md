# API 说明

## ConditionalSelection 组件参数

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| conditionalRules | 条件树数据 | TConditionalSelection \| null | null |
| maxDeep | 最大递归层级 | number | 1 |
| disabled | 是否禁用全部/部分操作 | boolean \| object | false |
| onChange | 数据变更回调 | (value) => void | - |
| renderConditionRules | 条件行插槽 | (item, change) => ReactNode | - |
| renderCreateCondition | 新增按钮插槽 | (params) => ReactNode | - |

## TConditionalSelection 结构

```ts
{
  _id: string;
  framework: 'group' | 'individual';
  link?: 'and' | 'or';
  group?: TConditionalSelection[];
  individual?: Record<string, any>;
  level: number;
}
```

## 事件说明
- `onChange`：每次条件树变更时触发，返回最新数据。
- `getRulesData`：通过 ref 获取当前条件树数据，支持校验。

## 插槽说明
- `renderConditionRules(item, change)`：自定义条件行内容，change 用于回传变更。
- `renderCreateCondition({ createRules, rulesData })`：自定义新增按钮。

## 其他
- 支持 less 样式、monorepo 结构。
