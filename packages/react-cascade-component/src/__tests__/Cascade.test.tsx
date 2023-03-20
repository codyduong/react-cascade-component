/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { render } from '@testing-library/react';
import domElements from '../utils/domElements';
import C from 'react-cascade-component';

// Filter out some html elements that require certain dom shapes
// or require a certain testing env to display
const testDomElements = domElements.filter(
  (elem) =>
    ![
      'body',
      'caption',
      'col',
      'colgroup',
      'head',
      'html',
      'keygen',
      'menuitem',
      'noindex',
      'tbody',
      'td',
      'tfoot',
      'th',
      'thead',
      'tr',
    ].includes(elem)
);

const fuzzIntrinsicElements = [null, false, NaN, 0, 1];

describe('Cascade', () => {
  describe('<Cascade as={...} />', () => {
    test('undefined', () => {
      const { container: c } = render(<C></C>);

      expect(c.getElementsByTagName('div')).toHaveLength(1);
    });
    test.each(fuzzIntrinsicElements)('%j', (domElement) => {
      const consoleWarn = jest
        .spyOn(global.console, 'error')
        .mockImplementation();
      expect(() => {
        render(<C as={domElement as any} />);
      }).toThrow(
        `Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: ${
          domElement === null ? 'null' : typeof domElement
        }.` + '\n\nCheck the render method of `ForwardRef(Cascade)`.'
      );
      consoleWarn.mockRestore();
    });
    test.each(testDomElements)('%s', (domElement) => {
      const { container: c } = render(<C as={domElement} />);
      expect(c.getElementsByTagName(domElement)).toHaveLength(1);
    });
  });
  describe('<Cascade[...] />', () => {
    test.each([undefined, 'foo', ...fuzzIntrinsicElements])(
      '%j',
      (domElement) => {
        const consoleWarn = jest
          .spyOn(global.console, 'error')
          .mockImplementation();
        expect(() => {
          const CascadeIntrinsicElement =
            C[domElement as unknown as keyof typeof C];
          render(<CascadeIntrinsicElement />);
        }).toThrow();
        consoleWarn.mockRestore();
      }
    );
    test.each(testDomElements)('%s', (domElement) => {
      const CascadeIntrinsicElement = C[domElement];
      const { container: c } = render(<CascadeIntrinsicElement />);
      expect(c.getElementsByTagName(domElement)).toHaveLength(1);
    });
  });
  describe('children', () => {
    test('{"foo":"bar"}', () => {
      const consoleWarn = jest
        .spyOn(global.console, 'error')
        .mockImplementation();
      // @ts-expect-error Invalid child on purpose
      expect(() => render(<C>{{ foo: 'bar' }}</C>)).toThrow(
        'Objects are not valid as a React child (found: object with keys {foo}). If you meant to render a collection of children, use an array instead.'
      );
      consoleWarn.mockRestore();
    });
    test('text children', () => {
      const { container: c } = render(
        <C>
          lorem ipsum {NaN} {1} {false} {true} {null} {'foo'}
        </C>
      );
      expect(c.textContent).toBe('lorem ipsum NaN 1    foo');
    });
  });
  test('indiscriminate cascade', () => {
    const { container: c } = render(
      <C className="foo" cascadeProps={{ className: 'bar' }}>
        <div />
        <div />
      </C>
    );

    // all elements rendered
    expect(c.getElementsByTagName('div')).toHaveLength(3);

    // child classes
    expect(c.getElementsByClassName('foo')).toHaveLength(1);
    expect(c.getElementsByClassName('bar')).toHaveLength(2);

    expect(c.firstElementChild?.childNodes).toHaveLength(2);
  });
  test('discriminated cascade (single type)', () => {
    const { container: c } = render(
      <C cascadeTo={'div'} cascadeProps={{ className: 'bar' }}>
        <div />
        <div />
        <span />
      </C>
    );

    // all elements rendered
    expect(c.getElementsByTagName('div')).toHaveLength(3);
    expect(c.getElementsByTagName('span')).toHaveLength(1);

    // child classes
    expect(c.getElementsByClassName('bar')).toHaveLength(2);

    expect(c.firstElementChild?.childNodes).toHaveLength(3);
  });
  test('discriminated cascade (array type)', () => {
    const { container: c } = render(
      <C cascadeTo={['div', 'span']} cascadeProps={{ className: 'bar' }}>
        <div />
        <div />
        <span />
        <label />
      </C>
    );

    // all elements rendered
    expect(c.getElementsByTagName('div')).toHaveLength(3);
    expect(c.getElementsByTagName('span')).toHaveLength(1);

    // child classes
    expect(c.getElementsByClassName('bar')).toHaveLength(3);

    expect(c.firstElementChild?.childNodes).toHaveLength(4);
  });
  test('deep indiscriminate cascade', () => {
    const { container: c } = render(
      <C className="foo" cascadeProps={{ className: 'bar' }}>
        <C className="bang">
          <C.span>
            <div />
            <div />
            <span />
            <label />
          </C.span>
          <C absorbProps={false}>
            <span />
            <label />
          </C>
          <div>
            <span />
            <label />
          </div>
        </C>
      </C>
    );

    // all elements rendered
    expect(c.getElementsByTagName('div')).toHaveLength(6);
    expect(c.getElementsByTagName('span')).toHaveLength(4);
    expect(c.getElementsByTagName('label')).toHaveLength(3);

    // child classes
    expect(c.getElementsByClassName('foo')).toHaveLength(1);
    expect(c.getElementsByClassName('bar')).toHaveLength(8);
    expect(c.getElementsByClassName('bang')).toHaveLength(1);

    // bang
    const childCascade = c.firstElementChild?.firstElementChild;
    expect(childCascade!.childNodes).toHaveLength(3);

    // C.span
    const childCascadeSpan = childCascade!.firstElementChild;
    expect(childCascadeSpan!.childNodes).toHaveLength(4);
  });
  test('deep discriminated cascade', () => {
    const { container: c } = render(
      <C className="foo" cascadeProps={{ className: 'bar' }}>
        <C className="bang" cascadeTo={[C, C.label, 'span']}>
          <C.span>
            <div />
            <div />
            <span />
            <label />
          </C.span>
          <C.label>
            <span />
            <label />
          </C.label>
          <C absorbProps={false}>
            <span />
            <label />
          </C>
          <div>
            <span />
            <label />
          </div>
        </C>
      </C>
    );

    // all elements rendered
    expect(c.getElementsByTagName('div')).toHaveLength(6);
    expect(c.getElementsByTagName('span')).toHaveLength(5);
    expect(c.getElementsByTagName('label')).toHaveLength(5);

    // child classes
    expect(c.getElementsByClassName('foo')).toHaveLength(1);
    expect(c.getElementsByClassName('bar')).toHaveLength(5);
    expect(c.getElementsByClassName('bang')).toHaveLength(1);

    // bang
    const childCascade = c.firstElementChild?.firstElementChild;
    expect(childCascade!.childNodes).toHaveLength(4);

    // C.span
    const childCascadeSpan = childCascade!.firstElementChild;
    expect(childCascadeSpan!.childNodes).toHaveLength(4);
  });
});
