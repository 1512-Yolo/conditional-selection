import React, { useMemo } from 'react';
import type {
  TConditionalSelection,
} from '../types';
import { useConditionalContext } from '../composables/useConditionalContext';

interface IConditionalHandleProps {
  currentItemInfo: TConditionalSelection;
  isLast: boolean;
  onCreate: () => void;
  onCreateChildRules: () => void;
  onDel: () => void;
}

function isEmptyValue(val: unknown): boolean {
  if (val === null || val === undefined || val === '') return true;
  if (Array.isArray(val)) return val.length === 0;
  if (val !== null && typeof val === 'object') return Object.keys(val as object).length === 0;
  return false;
}

function allHave(individual?: Record<string, any>): boolean {
  return (
    !!individual &&
    Object.keys(individual).length > 0 &&
    Object.keys(individual).every((key: string) => !isEmptyValue(individual[key]))
  );
}

/**
 * 规则操作按钮组（同级/子集/删除）
 */
const ConditionalHandle: React.FC<IConditionalHandleProps> = ({
  currentItemInfo,
  isLast,
  onCreate,
  onCreateChildRules,
  onDel,
}) => {
  const { level, disabledConfig } = useConditionalContext();
  /** 是否显示同级新增按钮：当前节点 level >= 1 且是最后一个 */
  const showCreate = useMemo(() => currentItemInfo.level >= 1 && isLast, [currentItemInfo.level, isLast]);

  /** 是否显示子集新增按钮：全局 level > 1 且当前节点 level 未达到上限 */
  const showCreateChild = useMemo(() => level > 1 && currentItemInfo.level < level, [level, currentItemInfo.level]);

  /** 整体新增按钮是否显示：level > 1 && 当前条件已填写完整 && 未禁用新增 */
  const createShow = useMemo(
    () => !!(level > 1 && allHave(currentItemInfo.individual) && !disabledConfig.addItem),
    [level, currentItemInfo.individual, disabledConfig.addItem],
  );

  return (
    <div className="conditional-handle">
      {createShow && (
        <>
          {showCreate && (
            <span className="create-handle" onClick={onCreate}>
              <span style={{ color: '#c85000', marginRight: 4 }}>＋</span>
              同级
            </span>
          )}
          {showCreateChild && (
            <span className="create-handle" onClick={onCreateChildRules}>
              <span style={{ color: '#c85000', marginRight: 4 }}>＋</span>
              子级
            </span>
          )}
        </>
      )}
      {!disabledConfig.delItem && (
        <span className="del-handle" onClick={onDel}>
          －
        </span>
      )}
    </div>
  );
};

export default ConditionalHandle;
