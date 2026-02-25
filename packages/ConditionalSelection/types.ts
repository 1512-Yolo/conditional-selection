import type { ReactNode } from 'react';

export enum EConditionalSelectionFramework {
  /** 内容组 */
  GROUP = 'group',
  /** 内容 */
  INDIVIDUAL = 'individual',
}

export enum EConditionalSelectionLink {
  AND = 'and',
  OR = 'or',
}

export type TConditionalSelection<T = any> = {
  _id: string;
  /** 结构标识 */
  framework: EConditionalSelectionFramework;
  /** 内容关系 */
  link?: EConditionalSelectionLink;
  group?: TConditionalSelection<T>[];
  individual?: Record<string, any>;
  level: number;
}

export type TConditionalSelectionDisabledProps = {
  addItem?: boolean;
  delItem?: boolean;
  linkChange?: boolean;
};

export type TConditionalSelectionProps = {
  /** 数据内容 */
  conditionalRules?: TConditionalSelection | null;
  /** deep 层级限制，需大于0，默认1 */
  maxDeep?: number;
  /** 是否禁用新增、删除、关系变更 */
  disabled?: boolean | TConditionalSelectionDisabledProps;
  /** 数据变更回调 */
  onChange?: (value: TConditionalSelection | undefined) => void;
  /** 渲染条件行内容的插槽，参数为当前 INDIVIDUAL 节点和变更 handler */
  renderConditionRules?: (
    conditionRulesData: TConditionalSelection,
    change: (data: Record<string, any>) => void
  ) => ReactNode;
  /** 渲染创建条件按钮插槽（createCondition） */
  renderCreateCondition?: (params: {
    createRules: (ruleData: TConditionalSelection) => void;
    rulesData: TConditionalSelection;
  }) => ReactNode;
};
