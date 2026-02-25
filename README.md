# Conditional Selection 组件库

## 简介
本项目为一个支持条件树编辑的 React 组件库，支持递归嵌套、条件分组、动态增删、禁用控制等功能，适用于复杂表单、规则配置等场景。

## 主要功能
- 条件树递归编辑
- 条件分组（AND/OR）切换
- 条件项动态增删
- 层级/数量/禁用等参数控制
- 插槽自定义条件行内容
- 状态管理采用 useImmer，数据流统一

## 使用方法

### 基本用法

```tsx
import React, { useMemo, useRef, useState } from 'react';
import { ConditionalSelection } from '../packages/ConditionalSelection';
import type { TConditionalSelection } from '../packages/ConditionalSelection/types';

const fieldOptions = [
  { label: '测试字段1', value: 1 },
  { label: '测试字段2', value: 2 },
];
const functionOptions = [
  { label: '等于', value: 1 },
  { label: '不等于', value: 2 },
];
const valueOptions = [
  { label: '测试值1', value: 1 },
  { label: '测试值2', value: 2 },
];

const FlexSelect: React.FC<{ item: TConditionalSelection; onChange: (val: Record<string, any>) => void }> = ({ item, onChange }) => {
  // field / function / value 存放在节点的 individual 里
  const data = useMemo(() => item.individual ?? {}, [item.individual]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onChange({ field: val, function: '', value: undefined });
  };

  const handleFunctionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onChange({ ...data, function: val, value: undefined });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onChange({ ...data, value: val });
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <select style={{ width: '33%', marginRight: 16 }} value={data.field ?? ''} onChange={handleFieldChange}>
        <option value="">请选择字段</option>
        {fieldOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {data.field && (
        <select style={{ width: '33%', marginRight: 16 }} value={data.function ?? ''} onChange={handleFunctionChange}>
          <option value="">请选择函数</option>
          {functionOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
      {data.function && (
        <select style={{ width: '33%', marginRight: 16 }} value={data.value ?? ''} onChange={handleValueChange}>
          <option value="">请选择值</option>
          {valueOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function App() {
  const refConditionalSelection = useRef<any>(null);
  const [rules, setRules] = useState<TConditionalSelection | undefined>();
  const [maxDeep, setMaxLevel] = useState(3);
  const [disabled, setDisabled] = useState(false);
  const [disabledConfig, setDisabledConfig] = useState({
    addItem: false,
    delItem: false,
    linkChange: false,
  });

  const getResult = async () => {
    const data = await refConditionalSelection.current.getConditionalSelectionData()
    console.log('当前数据：', data);
  }

  return (
      <ConditionalSelection
        ref={refConditionalSelection}
        conditionalRules={rules}
        maxDeep={maxDeep}
        disabled={disabled || disabledConfig}
        onChange={setRules}
        renderConditionRules={(item, change) => (
          <FlexSelect
            item={item}
            onChange={val => change(val)}
          />
        )}
      />
  );
}
```

### 参数说明
- `conditionalRules`：条件树数据（可为 null/undefined，自动初始化）
- `maxDeep`：最大递归层级（默认 1，需大于 0）
- `disabled`：是否禁用全部/部分操作（可传布尔或对象）
- `onChange`：数据变更回调
- `renderConditionRules`：插槽，渲染每个条件行内容，参数为当前节点和变更 handler

### 插槽自定义

插槽 `renderConditionRules` 支持自定义条件行内容，推荐用原生表单控件或自定义组件。

```tsx
const FlexSelect = ({ item, onChange }) => (
  <div>
    {/* 字段选择、函数选择、值选择等 */}
    <select ... onChange={...} />
    ...
  </div>
);
```

### 获取数据

可通过 ref 获取当前条件树数据：

```tsx
const ref = useRef<any>();
...
<ConditionalSelection ref={ref} ... />
...
const data = await ref.current.getConditionalSelectionData();
```

## 性能优化建议
- 递归 handler 用 useCallback 包裹，减少无谓重渲染
- 父组件插槽建议也用 useCallback
- 如需进一步性能分析，建议用 React Profiler

## 贡献与开发

1. 修改源码后可直接运行 `npm run dev` 查看效果
2. 支持 monorepo 结构，组件统一从 packages/index.ts 导出
3. 支持 less 样式

## License
MIT
