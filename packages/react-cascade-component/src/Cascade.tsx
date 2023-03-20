import React from 'react';
import * as utils from './utils';

export type CascadeAsElement =
  | keyof JSX.IntrinsicElements
  | React.JSXElementConstructor<any>;

export type CascadeToElements =
  | CascadeAsElement
  | CascadeAsElement[]
  | ReadonlyArray<CascadeAsElement>;

export type CascadeToProps<T extends CascadeToElements> = T extends
  | any[]
  | readonly any[]
  ? (keyof JSX.IntrinsicElements)[] extends T
    ? Record<string, unknown>
    : utils.UnionToIntersection<
        React.PropsWithoutRef<utils.GetProps<T[number]>>
      >
  : utils.GetProps<T>;

export type CascadeBaseProps<
  Element extends CascadeAsElement,
  ChildElements extends CascadeToElements,
  ExtraProps extends Record<string, unknown>
> = {
  as?: Element;
  cascadeTo?: ChildElements;
  cascadeProps?: CascadeToProps<ChildElements> &
    Omit<ExtraProps, keyof CascadeToProps<ChildElements>>;
  absorbProps?: boolean;
  // passProps?: boolean;
};

export type CascadeAsProps<Element extends CascadeAsElement> = Omit<
  utils.GetProps<Element>,
  keyof CascadeBaseProps<Element, any, any>
>;

export type CascadeRef<Element extends CascadeAsElement> = CascadeProps<
  Element,
  any,
  any
> extends { ref: any }
  ? CascadeProps<Element, any, any>['ref']
  : any;

export type CascadeProps<
  Element extends CascadeAsElement,
  ChildElements extends CascadeToElements,
  ExtraProps extends Record<string, unknown>
> = CascadeBaseProps<Element, ChildElements, ExtraProps> &
  CascadeAsProps<Element>;

function Cascade<
  Element extends keyof JSX.IntrinsicElements = 'div',
  ChildElements extends CascadeToElements = (keyof JSX.IntrinsicElements)[],
  ExtraProps extends Record<string, unknown> = Record<string, unknown>
>(
  props: CascadeProps<Element, ChildElements, ExtraProps>,
  ref: CascadeRef<Element>
): JSX.Element;
function Cascade<
  Element extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = 'div',
  ChildElements extends CascadeToElements = (keyof JSX.IntrinsicElements)[],
  ExtraProps extends Record<string, unknown> = Record<string, unknown>
>(
  /* eslint-disable prettier/prettier */
  {
    // @ts-expect-error: As long as no-one attempts to override generic manually, these subtypes will always match
    as
      = 'div',
    /* eslint-enable */
    children: cascadeChildren,
    cascadeProps,
    cascadeTo,
    absorbProps: _a,
    // passProps: _b,
    ...rest
  }: CascadeProps<Element, ChildElements, ExtraProps>,
  ref: CascadeRef<Element>
): JSX.Element {
  const children = React.Children.toArray(cascadeChildren).map((E) => {
    if (!React.isValidElement(E)) {
      return E;
    }
    let props = { ...cascadeProps, ...E.props };

    const Etype: any = E.type;
    if (
      Etype.render === Cascade ||
      Object.keys(MergedCascade)
        .map((key) => MergedCascade[key as keyof typeof MergedCascade])
        .indexOf(Etype) !== -1
    ) {
      const absorbProps = E.props.absorbProps ?? true;
      const passProps = true; // E.props.passProps ?? true;
      const absoredProps = absorbProps ? cascadeProps ?? {} : {};

      const passedProps = passProps ? cascadeProps ?? {} : {};
      props = {
        ...absoredProps,
        ...E.props,
        cascadeProps: { ...passedProps, ...(E.props.cascadeProps ?? {}) },
      };
    }

    if (!cascadeTo) {
      return React.createElement(E.type, props);
    }
    if (Array.isArray(cascadeTo) && cascadeTo.indexOf(E.type as any) !== -1) {
      return React.createElement(E.type, props);
    }
    if (cascadeTo === E.type) {
      return React.createElement(E.type, props);
    }

    return E;
  });

  return React.createElement(as, { ref, ...rest }, ...children);
}

type CascadeFC = <
  Element extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = 'div',
  ChildElements extends CascadeToElements = (keyof JSX.IntrinsicElements)[],
  ExtraProps extends Record<string, unknown> = Record<string, unknown>
>(
  props: CascadeProps<Element, ChildElements, ExtraProps>
) => JSX.Element;
const CascadeFC = React.forwardRef(Cascade);

type CascadeIntrinsicElement<Element extends keyof JSX.IntrinsicElements> = <
  ChildElements extends CascadeToElements = (keyof JSX.IntrinsicElements)[],
  ExtraProps extends Record<string, unknown> = Record<string, unknown>
>(
  props: CascadeProps<Element, ChildElements, ExtraProps>
) => JSX.Element;

function createCascadeIntrinsic<Key extends keyof JSX.IntrinsicElements>(
  domElement: Key
): CascadeIntrinsicElement<Key> {
  const rF = Object.assign(
    // eslint-disable-next-line react/display-name
    React.forwardRef<any, any>((props: any, ref: any): any => (
      <CascadeFC as={domElement} ref={ref} {...props} />
    )),
    { displayName: `Cascade.${domElement}` }
  ) as any;
  return rF;
}

type CascadeJSXIntrinsicElements = {
  [K in keyof JSX.IntrinsicElements as K extends (typeof utils.domElements)[number]
    ? K
    : never]: CascadeIntrinsicElement<K>;
};

// @ts-expect-error: Implicit
const CascadeIntrinsicElements: Record<keyof JSX.IntrinsicElements, any> = {};
utils.domElements.forEach((domElement) => {
  CascadeIntrinsicElements[domElement] = createCascadeIntrinsic(domElement);
});
const MergedCascade = Object.assign(
  CascadeFC,
  CascadeIntrinsicElements
) as CascadeFC & CascadeJSXIntrinsicElements;

export default MergedCascade;
