import { createContext, useContext } from 'react';
import type { TConditionalSelectionDisabledProps } from '../types';

interface IConditionalContext {
  level: number;
  disabledConfig: Required<TConditionalSelectionDisabledProps>;
}

export const ConditionalContext = createContext<IConditionalContext | null>(null);

export function useConditionalContext(): IConditionalContext {
  const ctx = useContext(ConditionalContext);
  if (!ctx) {
    throw new Error('useConditionalContext must be used within ConditionalContext.Provider');
  }
  return ctx;
}
