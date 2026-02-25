import { useMemo, useCallback } from 'react';
import { useImmer } from 'use-immer';
import { cloneDeep } from '../utils';
import {
  EConditionalSelectionLink,
  EConditionalSelectionFramework,
  type TConditionalSelection,
  type TConditionalSelectionProps,
  type TConditionalSelectionDisabledProps,
} from '../types';

function isObject(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function isEmptyValue(val: unknown): boolean {
  if (val === null || val === undefined || val === '') return true;
  if (Array.isArray(val)) return val.length === 0;
  if (isObject(val)) return Object.keys(val).length === 0;
  return false;
}

export function getTempRules(level = 0): TConditionalSelection {
  return cloneDeep({
    _id: crypto.randomUUID(),
    framework: EConditionalSelectionFramework.INDIVIDUAL,
    // INDIVIDUAL 节点只保留 individual，不初始化 group
    individual: {},
    level,
  }) as TConditionalSelection;
}

export function isGroup(ruleData: TConditionalSelection): boolean {
  return ruleData.framework === EConditionalSelectionFramework.GROUP;
}

function allHave(individual?: Record<string, any>): boolean {
  return (
    !!individual &&
    Object.keys(individual).length > 0 &&
    Object.keys(individual).every((key: string) => !isEmptyValue(individual[key]))
  );
}

function checkData(data: TConditionalSelection): boolean {
  if (isGroup(data) && Array.isArray(data.group)) {
    // GROUP 节点：递归检查 group 数组中的每个子项
    return data.group.some(item => checkData(item));
  }
  // INDIVIDUAL 节点：检查 individual 是否填写完整
  return !allHave(data.individual);
}

function subtractLevel(rulesData: TConditionalSelection): void {
  // 只有 GROUP 节点才有 group 数组
  if (isGroup(rulesData) && Array.isArray(rulesData.group) && rulesData.group.length > 1) {
    rulesData.group.forEach(item => subtractLevel(item));
  }
  rulesData.level = rulesData.level - 1 < 0 ? 0 : rulesData.level - 1;
}

/** 在树中按 _id 深度优先查找节点 */
export function findNode(root: TConditionalSelection, id: string): TConditionalSelection | null {
  if (root._id === id) return root;
  if (Array.isArray(root.group)) {
    for (const child of root.group) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

export interface IUseConditionalHandleReturn {
  rulesData: TConditionalSelection;
  setRulesData: (data: TConditionalSelection) => void;
  updateRulesData: (updater: (draft: TConditionalSelection) => void) => void;
  level: number;
  disabledConfig: Required<TConditionalSelectionDisabledProps>;
  createRules: (ruleData: TConditionalSelection) => void;
  createChildRules: (ruleData: TConditionalSelection) => void;
  delRules: (ruleData: TConditionalSelection, index: number) => void;
  getConditionalSelectionData: (validate?: boolean) => Promise<TConditionalSelection>;
  isGroup: (ruleData: TConditionalSelection) => boolean;
  getTempRules: (level?: number) => TConditionalSelection;
}

export function useConditionalHandle(props: TConditionalSelectionProps): IUseConditionalHandleReturn {
  const [rulesData, updateRulesData] = useImmer<TConditionalSelection>(() => getTempRules());

  // 对外保持 setRulesData 接口不变（直接替换整棵树）
  const setRulesData = useCallback((data: TConditionalSelection) => {
    updateRulesData(() => data);
  }, [updateRulesData]);

  // level 计算
  const level = useMemo(() => {
    const v = Math.abs(Number(props.maxDeep ?? 1)) || 1;
    if (Number(props.maxDeep ?? 1) < 1) {
      console.warn('[TConditionalSelection] Invalid props.maxDeep: maxDeep must be greater than 0.');
    }
    return v;
  }, [props.maxDeep]);

  // disabledConfig 计算
  const disabledConfig = useMemo<Required<TConditionalSelectionDisabledProps>>(() => {
    const isObj = isObject(props.disabled);
    return {
      addItem: !!(isObj ? (props.disabled as TConditionalSelectionDisabledProps)?.addItem : props.disabled),
      delItem: !!(isObj ? (props.disabled as TConditionalSelectionDisabledProps)?.delItem : props.disabled),
      linkChange: !!(isObj ? (props.disabled as TConditionalSelectionDisabledProps)?.linkChange : props.disabled),
    };
  }, [props.disabled]);

  // 创建同级规则：向当前 GROUP 节点的 group 数组追加一个新 INDIVIDUAL 节点
  const createRules = useCallback(
    (ruleData: TConditionalSelection) => {
      if (!isGroup(ruleData)) return;
      updateRulesData(draft => {
        const target = findNode(draft, ruleData._id);
        if (target && Array.isArray(target.group)) {
          target.group.push(getTempRules(target.level + 1));
        }
      });
    },
    [updateRulesData],
  );

  // 创建子级规则：将当前 INDIVIDUAL 节点升级为 GROUP 节点
  const createChildRules = useCallback(
    (ruleData: TConditionalSelection) => {
      updateRulesData(draft => {
        const target = findNode(draft, ruleData._id);
        if (!target) return;

        if (target.framework === EConditionalSelectionFramework.INDIVIDUAL) {
          const firstChild: TConditionalSelection = {
            _id: crypto.randomUUID(),
            framework: EConditionalSelectionFramework.INDIVIDUAL,
            individual: cloneDeep(target.individual ?? {}),
            level: target.level + 1,
          };
          const secondChild = getTempRules(target.level + 1);
          target.framework = EConditionalSelectionFramework.GROUP;
          target.link = EConditionalSelectionLink.AND;
          target._id = crypto.randomUUID();
          target.group = [firstChild, secondChild];
          delete target.individual;
        } else {
          // 已是 GROUP，追加子项
          if (Array.isArray(target.group)) {
            target.group.push(getTempRules(target.level + 1));
          }
        }
      });
    },
    [updateRulesData],
  );

  // 删除规则
  const delRules = useCallback((ruleData: TConditionalSelection, index: number) => {
    updateRulesData(draft => {
      const target = findNode(draft, ruleData._id);
      if (!target || !Array.isArray(target.group)) return;

      target.group.splice(index, 1);

      if (target.framework === EConditionalSelectionFramework.GROUP && target.group.length === 1) {
        const onlyChild = target.group[0];
        if (
          onlyChild.framework === EConditionalSelectionFramework.GROUP &&
          Array.isArray(onlyChild.group) &&
          onlyChild.group.length > 1
        ) {
          // 唯一子项是 GROUP，提升到当前节点
          target.framework = EConditionalSelectionFramework.GROUP;
          target.link = onlyChild.link;
          target._id = onlyChild._id;
          target.group = onlyChild.group;
          delete target.individual;
        } else {
          // 唯一子项是 INDIVIDUAL，降级
          target.framework = EConditionalSelectionFramework.INDIVIDUAL;
          target._id = onlyChild._id;
          target.individual = cloneDeep(onlyChild.individual ?? {});
          delete target.link;
          delete target.group;
        }
        subtractLevel(onlyChild);
      }
    });
  }, [updateRulesData]);

  // 获取并校验数据
  const getConditionalSelectionData = useCallback(
    (validate = true): Promise<TConditionalSelection> => {
      return new Promise((resolve, reject) => {
        if (validate && checkData(rulesData)) {
          console.error('请填写完整');
          reject('含有未填写完整的项');
          return;
        }
        resolve(cloneDeep(rulesData));
      });
    },
    [rulesData],
  );

  return {
    rulesData,
    setRulesData,
    level,
    disabledConfig,
    createRules,
    createChildRules,
    delRules,
    getConditionalSelectionData,
    isGroup,
    getTempRules,
    updateRulesData,
  };
}
