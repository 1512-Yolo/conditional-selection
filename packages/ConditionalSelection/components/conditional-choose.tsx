import React from 'react';
import { EConditionalSelectionLink } from '../types';

interface IConditionalChooseProps {
  value: EConditionalSelectionLink;
  disabled?: boolean;
  onChange: (value: EConditionalSelectionLink) => void;
}

const logicMaps: Record<EConditionalSelectionLink, string> = {
  [EConditionalSelectionLink.OR]: '或',
  [EConditionalSelectionLink.AND]: '且',
};

/**
 * 条件切换组件（且/或）
 */
const ConditionalChoose: React.FC<IConditionalChooseProps> = ({ value, disabled, onChange }) => {
  function toggleLogic() {
    if (disabled) return;
    onChange(value === EConditionalSelectionLink.OR ? EConditionalSelectionLink.AND : EConditionalSelectionLink.OR);
  }

  return (
    <div className="link-line">
      <div className="link-label" onClick={toggleLogic}>
        {logicMaps[value] ?? '且'}
      </div>
    </div>
  );
};

export default ConditionalChoose;
