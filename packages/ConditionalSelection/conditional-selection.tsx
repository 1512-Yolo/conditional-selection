import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { cloneDeep } from './utils';
import ConditionalContent from './components/conditional-content';
import { useConditionalHandle, getTempRules, isGroup, findNode } from './composables/useConditionalHandle';
import { ConditionalContext } from './composables/useConditionalContext';
import { type TConditionalSelectionProps } from './types';
import './index.less';

const ConditionalSelection = forwardRef<
  { getConditionalSelectionData: (validate?: boolean) => Promise<any> },
  TConditionalSelectionProps
>((props, ref) => {
  const { conditionalRules, onChange, renderConditionRules, renderCreateCondition } = props;

  const { rulesData, setRulesData, level, disabledConfig, createRules, createChildRules, delRules, getConditionalSelectionData, updateRulesData } =
    useConditionalHandle(props);

  // 暴露 getConditionalSelectionData 给父组件
  useImperativeHandle(ref, () => ({ getConditionalSelectionData }), [getConditionalSelectionData]);

  // 监听 rulesData 变化并抛出 onChange
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChange?.(rulesData);
  }, [rulesData]);

  //初始化
  useEffect(() => {
    if (conditionalRules && Object.keys(conditionalRules).length !== 0) {
      setRulesData(cloneDeep(conditionalRules));
    } else {
      setRulesData(getTempRules());
    }
  }, []);

  // 递归/slot相关 handler 用 useCallback 包裹，依赖项只放 updateRulesData/findNode/renderConditionRules
  const handleUpdateNode = useCallback((nodeId: string, patch: Partial<any>) => {
    updateRulesData(draft => {
      const target = findNode(draft, nodeId);
      if (!target) return;
      Object.assign(target, patch);
    });
  }, [updateRulesData]);

  const handleRenderConditionItem = useCallback(
    (item: any) => renderConditionRules?.(item, (val: Record<string, any>) => {
      updateRulesData(draft => {
        const target = findNode(draft, item._id);
        if (!target) return;
        target.individual = val;
      });
    }),
    [renderConditionRules, updateRulesData]
  );

  const handleRenderConditionRules = useCallback(
    (rulesData: any, change: (val: Record<string, any>) => void) =>
      renderConditionRules?.(rulesData, change),
    [renderConditionRules]
  );

  return (
    <ConditionalContext.Provider value={{ level, disabledConfig }}>
    <div className="conditional-selection">
      {/* 新增条件按钮区域 */}
      {!disabledConfig.addItem &&
        (renderCreateCondition ? (
          renderCreateCondition({ createRules: createChildRules, rulesData })
        ) : (
          <span className="create-box" onClick={() => createChildRules(rulesData)}>
            <span style={{ color: '#00c8be', marginRight: 4 }}>➕</span>
            添加条件
          </span>
        ))}

      {/* 规则内容区域 */}
      <div className="conditional-content">
        {isGroup(rulesData) && (rulesData.group as any[]).length > 0 ? (
          <ConditionalContent
            levelData={rulesData}
            onUpdateNode={handleUpdateNode}
            onCreateRules={createRules}
            onCreateChildRules={createChildRules}
            onDelRules={delRules}
            renderConditionItem={handleRenderConditionItem}
          />
        ) : (
          handleRenderConditionRules(rulesData, (val: Record<string, any>) => {
            updateRulesData(draft => {
              const target = findNode(draft, rulesData._id);
              if (!target) return;
              target.individual = val;
            });
          })
        )}
      </div>
    </div>
    </ConditionalContext.Provider>
  );
});

ConditionalSelection.displayName = 'ConditionalSelection';

export default ConditionalSelection;
