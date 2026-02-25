import React from 'react';
import ConditionalChoose from './conditional-choose';
import ConditionalHandle from './conditional-handle';
import {
  EConditionalSelectionLink,
  type TConditionalSelection,
  type TConditionalSelectionDisabledProps,
} from '../types';
import { isGroup } from '../composables/useConditionalHandle';
interface IConditionalContentProps {
  levelData: TConditionalSelection;
  level: number;
  disabledConfig: Required<TConditionalSelectionDisabledProps>;
  onUpdateNode: (nodeId: string, patch: Partial<TConditionalSelection>) => void;
  onCreateRules: (ruleData: TConditionalSelection) => void;
  onCreateChildRules: (ruleData: TConditionalSelection) => void;
  onDelRules: (ruleData: TConditionalSelection, index: number) => void;
  /** 渲染单行条件内容 */
  renderConditionItem?: (rulesLevelItem: TConditionalSelection) => React.ReactNode;
}

/**
 * 获取是否是"最后一个条件"位置，用于控制同级新增按钮
 */
function getLastCondition(index: number, group: TConditionalSelection[]): boolean {
  const lastIndex = group.length - 1;
  const tempInfo = group[lastIndex];
  let flag = index === lastIndex;
  if (!flag && tempInfo && isGroup(tempInfo)) {
    flag = index === group.length - 2;
  }
  return flag;
}

/**
 * 条件内容组件（递归渲染嵌套规则树）
 * 对应 Vue 版 relation-content.vue
 */
const ConditionalContent: React.FC<IConditionalContentProps> = ({
  levelData,
  level,
  disabledConfig,
  onUpdateNode,
  onCreateRules,
  onCreateChildRules,
  onDelRules,
  renderConditionItem,
}) => {
  const group = levelData.group as TConditionalSelection[];

  function handleLinkChange(value: EConditionalSelectionLink) {
    onUpdateNode(levelData._id, { link: value });
  }

  return (
    <div className="relative-box">
      {/* 且/或 切换 */}
      <ConditionalChoose
        value={levelData.link ?? EConditionalSelectionLink.AND}
        disabled={disabledConfig.linkChange}
        onChange={handleLinkChange}
      />

      <div className="conditional-list-box right-box">
        {group.map((item, index) => {
          if (isGroup(item)) {
            const childRules = item.group as TConditionalSelection[];
            return (
              <div key={item._id} className="conditional-list">
                <div className="relative-box">
                  <ConditionalChoose
                    value={item.link ?? EConditionalSelectionLink.AND}
                    disabled={disabledConfig.linkChange}
                    onChange={val => onUpdateNode(item._id, { link: val })}
                  />
                  {childRules.map((child, childIndex) => {
                    if (isGroup(child) && (child.group as TConditionalSelection[]).length > 0) {
                      return (
                        <div key={child._id} className="conditional-item right-box">
                          <ConditionalContent
                            levelData={child}
                            level={level}
                            disabledConfig={disabledConfig}
                            onUpdateNode={onUpdateNode}
                            onCreateRules={onCreateRules}
                            onCreateChildRules={onCreateChildRules}
                            onDelRules={onDelRules}
                            renderConditionItem={renderConditionItem}
                          />
                        </div>
                      );
                    }
                    return (
                      <div key={child._id} className="conditional-item right-box">
                        {renderConditionItem?.(child)}
                        <ConditionalHandle
                          level={level}
                          disabledConfig={disabledConfig}
                          currentItemInfo={child}
                          isLast={getLastCondition(childIndex, childRules)}
                          onCreate={() => onCreateRules(item)}
                          onCreateChildRules={() => onCreateChildRules(child)}
                          onDel={() => onDelRules(item, childIndex)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <div key={item._id} className="conditional-list">
              <div className="conditional-item">
                {renderConditionItem?.(item)}
                <ConditionalHandle
                  level={level}
                  disabledConfig={disabledConfig}
                  currentItemInfo={item}
                  isLast={getLastCondition(index, group)}
                  onCreate={() => onCreateRules(levelData)}
                  onCreateChildRules={() => onCreateChildRules(item)}
                  onDel={() => onDelRules(levelData, index)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConditionalContent;
