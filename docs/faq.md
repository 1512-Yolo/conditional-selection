# 常见问题 FAQ

### 1. 如何自定义条件行内容？
使用 `renderConditionRules` 插槽，传入自定义组件并用 change handler 回传数据。

### 2. 如何获取当前条件树数据？
通过 ref 调用 `getRulesData()` 方法。

### 3. 为什么要用 useImmer？
保证数据不可变、递归更新高效，避免直接修改原始对象。

### 4. 如何避免递归组件无谓重渲染？
递归 handler 用 useCallback 包裹，父组件插槽也建议 useCallback。

### 5. 支持哪些样式扩展？
支持 less，样式可自定义覆盖。

如有更多问题，欢迎补充！
