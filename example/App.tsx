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
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div className="level-setting">
          设置层级：
          <input
            type="number"
            min={1}
            value={maxDeep}
            onChange={e => setMaxLevel(Number(e.target.value) || 1)}
            style={{ width: 80, marginLeft: 8 }}
          />
        </div>
        <div className="level-setting">
          全部禁用：
          <input
            type="checkbox"
            checked={disabled}
            onChange={e => setDisabled(e.target.checked)}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div className="level-setting">
          禁用添加：
          <input
            type="checkbox"
            checked={disabledConfig.addItem}
            onChange={e => setDisabledConfig(cfg => ({ ...cfg, addItem: e.target.checked }))}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div className="level-setting">
          禁用删除：
          <input
            type="checkbox"
            checked={disabledConfig.delItem}
            onChange={e => setDisabledConfig(cfg => ({ ...cfg, delItem: e.target.checked }))}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div className="level-setting">
          禁用变化关系：
          <input
            type="checkbox"
            checked={disabledConfig.linkChange}
            onChange={e => setDisabledConfig(cfg => ({ ...cfg, linkChange: e.target.checked }))}
            style={{ marginLeft: 8 }}
          />
        </div>
        <button className="btn" style={{ marginLeft: 8 }} onClick={() => setRules(undefined)}>清空数据</button>
        <button className="btn" style={{ marginLeft: 8 }} onClick={getResult}>获取数据</button>
      </div>
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
      <pre style={{ marginTop: 24, fontSize: 12 }}>{JSON.stringify(rules, null, 2)}</pre>
    </div>
  );
}
