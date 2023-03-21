<div align="center">
  <a href="https://www.npmjs.com/package/react-cascade-component"><img src="https://img.shields.io/npm/v/react-cascade-component.svg" alt="downloads per/month"></a>
  <a href="https://bundlephobia.com/result?p=react-cascade-component" title="react-cascade-component latest minified+gzip size"><img src="https://badgen.net/bundlephobia/minzip/react-cascade-component" alt="gzip size"></a>
  <a href="#alternative-installation-methods"><img src="https://img.shields.io/badge/module%20formats-umd%2C%20cjs%2C%20esm-green.svg" alt="module formats: umd, cjs, esm"></a>
  <a href="https://codecov.io/gh/codyduong/react-cascade-component"><img src="https://codecov.io/gh/codyduong/react-cascade-component/coverage.svg?branch=main" alt="Code Coverage"></a>
</div>

# React-Cascade-Component

Introducing CSS cascading to React components with first-class Typescript support right out of the box.

DRY out your code. Repeat yourself less with less hassle.

## Installation

| npm  | yarn |
| ------------- | ------------- |
| `npm install react-cascade-component` | `yarn add react-cascade-component` |

## Example Use Case

```tsx
import Cascade from 'react-cascade-component';

const App = () => {
  const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    alert(`Button ${e.currentTarget.id} was clicked!`);
  };

  return (
    <Cascade cascadeTo="button" cascadeProps={{ onClick: onClickHandler }}>
      <div />
      <div />
      <button id="1" />
      <button id="2" />
      <button id="3" />
    </Cascade>
  );
};
```

Cascade by default is a `div` element but can be of any `JSX.IntrinsicElement` by setting
the `as` prop value or using `Cascade.[JSX.IntrinsicElement]` .

```tsx
<Cascade as="span">{/* ... */}</Cascade>
<Cascade.span>{/* ... */}</Cascade.span>
```
## API

<table>
  <tr>
    <th>prop</th>
    <th>type</th>
    <th>examples</th>
  </tr>
  <tr>
    <td>
      <h3>as</h3>
      Specifies what <code>&lt;Cascade/&gt;</code> is rendered as  
    </td>
    <td>
      <code>keyof JSX.IntrinsicElement</code><br></br>
      <code>React.JSXElementConstructor&lt;any&gt;</code>
    </td>
    <td>
      <code>"div"</code><br></br>
      <code>"span"</code><br></br>
      <code>MyCustomComponent</code><br></br>
    </td>
  </td>
  <tr>
    <td>
      <h3>cascadeTo</h3>
      Specifies which child elements <code>cascadeProps</code> is sent to 
    </td>
    <td>
      <code>keyof JSX.IntrinsicElement</code><br></br>
      <code>React.JSXElementConstructor&lt;any&gt;</code>
      <code>(keyof JSX.IntrinsicElement | React.JSXElementConstructor&lt;any&gt;)[]</code><br></br>
    </td>
    <td>
      <code>"div"</code><br></br>
      <code>["span", "div"]</code><br></br>
      <code>MyCustomComponent</code><br></br>
      <code>['span', MyCustomComponent]</code><br></br>
    </td>
  </tr>
  <tr>
    <td>
      <h3>cascadeProps</h3>
      The `props` to cascade to child elements
    </td>
    <td>
      <code>any</code><a href="#footnote-1"><sup>1</sup></a>
    </td>
    <td>
      <code>{"className": "foobar", "customKey": "customValue"}</code>
    </td>
  </tr>
  <tr>
    <td>
      <h3>absorbProps</h3>
      Whether or not the <code>&lt;Cascade&gt;</code> will absorb the
      properties itself, or simply pass it on. Defaults to <code>true</code>
    </td>
    <td>
      <code>boolean</code>
    </td>
    <td>
      <code>true</code> <code>false</code>
    </td>
  </tr>
  <tr>
    <td>
      <h3>...rest</h3>
      Any other properties to be used by <code>&lt;Cascade&gt;</code>
    </td>
    <td>
      <code>JSX.IntrinsicElement[typeof as]</code>
    </td>
    <td>
      Valid other properties may be <code>ref</code> <code>className</code> <code>id</code> and more
    </td>
  </tr>
</table>
<p id="footnote-1"><b>1</b> - The is not technically true, but practically true. It has a type dependent on <code>cascadeTo</code>, and will have type inference if <code>cascadeTo</code> is provided</p>

## Demos

### CascadeTo Callback
The `<Cascade>` component has a callback parameter on `cascadeTo` which means you can specify handling, by default the callback is `(callbackProps, originalProps) => {...callbackProps, ...originalProps}`, ie. a shallow merge.

```tsx
<Cascade
  cascadeTo={[
    ['button', (c, o) => ({ ...c.buttonProps, ...o })],
    [MyCustomComponent, (c, o) => ({ ...c.customProps, ...o })],
  ]}
  cascadeProps={{
    buttonProps: {
      onClick: onClickHandler,
    },
    customProps: {
      className: 'foobar'
    }
  }}
>
  <button />
  <div />
  <MyCustomComponent />
</Cascade>
```

You can also specify a function instead:
```tsx
<Cascade
  cascadeTo={(t, c, o) => {
    if (t === 'button') {
      return {...c.buttonProps, ...o}
    }
    if (t === MyCustomComponent) {
      return {...c.customProps, ...o}
    }
  }}
  cascadeProps={{
    buttonProps: {
      onClick: onClickHandler,
    },
    customProps: {
      className: 'foobar'
    }
  }}
>
  <button />
  <div />
  <MyCustomComponent />
</Cascade>
```

### Nested Cascades
The `<Cascade>` component can pass through to each other. By default it will both absorb and pass properties.
However, nested `<Cascade>` components will not cascadeTo the same constrained types, instead widening out again. 
`<Cascade absorbProps={false} />` will disable absorbing props but will still pass through through properties.

```tsx
<Cascade className="foo" cascadeProps={{ className: 'bar' }}>
  <Cascade 
    className="bang" 
    cascadeTo={[Cascade, Cascade.label, 'span']}
  >
    <Cascade.span>                
      <div />
      <div />
      <span />                    
      <label />
    </Cascade.span>
    <Cascade.label>               {/* className="bar" */}
      <span />                    {/* className="bar" */}
      <label />                   {/* className="bar" */}
    </Cascade.label>
    <Cascade                      /* className=undefined */
      absorbProps={false}
      cascadeTo="label"
    > 
      <span />                    {/* className="bar" */}
      <label />                   {/* className="bar" */}
    </Cascade>
    <div>
      <span />
      <label />
    </div>
  </Cascade>
</Cascade>;
```

#### [View the test cases for more example usages](./packages/react-cascade-component/src/__tests__/Cascade.test.tsx)

## Alternatives

If you are simply using `react-cascade-component` as a means to transfer props deeply in your component, 
instead consider using React's built-in [ `useContext` ](https://react.dev/reference/react/useContext).

## Contribute

Contributions are welcome!

## License

Licensed under the MIT License, Copyright © 2023-present Cody Duong.

See [LICENSE](./LICENSE) for more information.
