<div align="center">
  <a href="https://www.npmjs.com/package/react-cascade-component"><img src="https://img.shields.io/npm/v/react-cascade-component.svg" alt="downloads per/month"></a>
  <a href="https://bundlephobia.com/result?p=react-cascade-component" title="react-cascade-component latest minified+gzip size"><img src="https://badgen.net/bundlephobia/minzip/react-cascade-component" alt="gzip size"></a>
  <a href="#alternative-installation-methods"><img src="https://img.shields.io/badge/module%20formats-umd%2C%20cjs%2C%20esm-green.svg" alt="module formats: umd, cjs, esm"></a>
  <a href="https://codecov.io/gh/codyduong/react-cascade-component"><img src="https://codecov.io/gh/codyduong/react-cascade-component/coverage.svg?branch=main" alt="Code Coverage"></a>
</div>

# React-Cascade-Component

Introducing CSS cascading to React components with first-class Typescript support right out of the box.

DRY out your code. Repeat yourself less with less-hassle.

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
the `as` prop value or using `Cascade.[JSX.IntrinsicElement]`.

```tsx
<Cascade as="span">{/* ... */}</Cascade>
<Cascade.span>{/* ... */}</Cascade.span>
```

### Advanced Demonstration

```tsx
<Cascade className="foo" cascadeProps={{ className: 'bar' }}>
  <Cascade 
    className="bang" 
    cascadeTo={[Cascade, Cascade.label, 'span']}
  >
    <Cascade.span>                {/* className="bar" */}
      <div />
      <div />
      <span />                    {/* className="bar" */}
      <label />
    </Cascade.span>
    <Cascade.label>               {/* className="bar" */}
      <span />                    {/* className="bar" */}
      <label />
    </Cascade.label>
    <Cascade                      /* className=undefined */
      absorbProps={false}
      cascadeTo="label"
    > 
      <span />                    
      <label />                   {/* className="bar" */}
    </Cascade>
    <div>
      <span />
      <label />
    </div>
  </Cascade>
</Cascade>;
```

The `<Cascade>` component can pass through to each other. By default it will both absorb the passed properties and
continue to pass through the other components. 

[View the test cases for more example usages](./packages/react-cascade-component/src/__tests__/Cascade.test.tsx)

## Alternatives

If you are simply using `react-cascade-component` as a means to transfer props deeply in your component, 
instead consider using React's built-in [ `useContext` ](https://react.dev/reference/react/useContext).

## Contribute
Contributions are welcome!

## License

Licensed under the MIT License, Copyright © 2023-present Cody Duong.

See [LICENSE](./LICENSE) for more information.
