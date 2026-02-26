# conditional-selection

A lightweight React component library for building conditional rule trees. Supports recursive nesting, AND/OR grouping, dynamic add/remove, and fully customizable condition rows via render props.

## Installation

```bash
npm install conditional-selection
```

> **Peer dependencies:** `react >= 16.8.0`, `react-dom >= 16.8.0`

## Quick Start

```tsx
import { ConditionalSelection } from 'conditional-selection';
import type { TConditionalSelection } from 'conditional-selection';

export default function App() {
  const [rules, setRules] = useState<TConditionalSelection | undefined>();

  return (
    <ConditionalSelection
      conditionalRules={rules}
      maxDeep={3}
      onChange={setRules}
      renderConditionRules={(item, change) => (
        <MyConditionRow item={item} onChange={change} />
      )}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `conditionalRules` | `TConditionalSelection \| null` | `undefined` | The condition tree data. Automatically initialized if `null` or `undefined`. |
| `maxDeep` | `number` | `1` | Maximum recursion depth. Must be greater than `0`. |
| `disabled` | `boolean \| TConditionalSelectionDisabledProps` | `false` | Disable all or specific operations. |
| `onChange` | `(value: TConditionalSelection \| undefined) => void` | — | Callback fired when the tree data changes. |
| `renderConditionRules` | `(item, change) => ReactNode` | — | Render prop for each condition row. Receives the current `INDIVIDUAL` node and an update handler. |
| `renderCreateCondition` | `(params) => ReactNode` | — | Render prop to customize the "Add condition" button. |

### `disabled` object shape

```ts
type TConditionalSelectionDisabledProps = {
  addItem?: boolean;    // disable adding new conditions
  delItem?: boolean;    // disable deleting conditions
  linkChange?: boolean; // disable AND/OR toggle
};
```

## Data Structure

```ts
type TConditionalSelection<T = any> = {
  _id: string;
  framework: 'group' | 'individual';
  link?: 'and' | 'or';
  group?: TConditionalSelection<T>[];
  individual?: Record<string, any>;
  level: number;
};
```

- **`group`** node — contains child nodes and an AND/OR relationship toggle.
- **`individual`** node — a single condition row; its data lives in the `individual` field.

### Example Output

**Flat structure** — two `individual` conditions joined by AND:

```json
{
  "_id": "2dfd8d9d-4bbf-4bc3-aae6-6c747ccbdd10",
  "framework": "group",
  "level": 0,
  "link": "and",
  "group": [
    {
      "_id": "02399b6c-10a3-41d4-9722-cce2db9ae056",
      "framework": "individual",
      "individual": { "field": 1, "function": 1, "value": 1 },
      "level": 1
    },
    {
      "_id": "6c627903-b970-43a8-a3f5-f5aba89f2200",
      "framework": "individual",
      "individual": { "field": 1, "function": 1, "value": 1 },
      "level": 1
    }
  ]
}
```

**Nested structure** — an `individual` AND a nested `group` (OR) at level 1:

```json
{
  "_id": "2dfd8d9d-4bbf-4bc3-aae6-6c747ccbdd10",
  "framework": "group",
  "level": 0,
  "link": "and",
  "group": [
    {
      "_id": "02399b6c-10a3-41d4-9722-cce2db9ae056",
      "framework": "individual",
      "individual": { "field": 1, "function": 1, "value": 1 },
      "level": 1
    },
    {
      "_id": "2f808fe6-4dd8-488d-9b79-d2888915fddc",
      "framework": "group",
      "level": 1,
      "link": "or",
      "group": [
        {
          "_id": "17336bf2-2885-4350-8055-233b0058ec39",
          "framework": "individual",
          "individual": { "field": 1, "function": 1, "value": 1 },
          "level": 2
        },
        {
          "_id": "6e21bd9a-f994-474a-bba5-d77ac9013a65",
          "framework": "individual",
          "individual": { "field": 1, "function": 1, "value": 1 },
          "level": 2
        }
      ]
    }
  ]
}
```

## Accessing Data via Ref

```tsx
const ref = useRef<any>(null);

<ConditionalSelection ref={ref} ... />

// Returns a deep clone of the current tree
const data = await ref.current.getConditionalSelectionData();
```

## Custom Condition Row Example

```tsx
const MyConditionRow = ({ item, onChange }) => {
  const data = item.individual ?? {};
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <select value={data.field ?? ''} onChange={e => onChange({ field: e.target.value })}>
        <option value="">Select field</option>
        <option value="name">Name</option>
      </select>
      <select value={data.operator ?? ''} onChange={e => onChange({ ...data, operator: e.target.value })}>
        <option value="">Select operator</option>
        <option value="eq">Equals</option>
        <option value="ne">Not equals</option>
      </select>
      <input
        value={data.value ?? ''}
        onChange={e => onChange({ ...data, value: e.target.value })}
        placeholder="Value"
      />
    </div>
  );
};
```

## Performance Tips

- Wrap handlers and render props with `useCallback` to avoid unnecessary re-renders.
- Use [React Profiler](https://react.dev/reference/react/Profiler) for deeper performance analysis.

## Contributing

```bash
git clone https://github.com/1512-Yolo/conditional-selection.git
cd conditional-selection
npm install
npm run dev
```

Components are exported from `packages/index.ts`. Styles are written in Less (`packages/ConditionalSelection/index.less`).

## License

MIT

---
