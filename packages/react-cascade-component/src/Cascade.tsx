import React from 'react';
import * as utils from './utils';
import { ParsedCascadeToReturn } from './utils';

export type CascadeAsType =
  | keyof JSX.IntrinsicElements
  | React.JSXElementConstructor<any>;

export type CascadeToCallbackSingle<
  ElemType extends CascadeAsType,
  ExtraPropsFix extends Record<string, unknown>
> = (
  type: ElemType,
  cascadedProps: utils.GetProps<ElemType> & ExtraPropsFix,
  originalProps: utils.GetProps<ElemType>
) => utils.GetProps<ElemType> | undefined;

export type CascadeToCallbackObject<
  ElemType extends CascadeAsType,
  ExtraPropsFix extends Record<string, unknown>
> = {
  type: ElemType;
  callback?: (
    cascadedProps: utils.GetProps<ElemType> & ExtraPropsFix,
    originalProps: utils.GetProps<ElemType>
  ) => utils.GetProps<ElemType> | undefined;
};

export type CascadeToCallbackArray<
  ElemType extends CascadeAsType,
  ExtraPropsFix extends Record<string, unknown>
> = [
  type: CascadeToCallbackObject<ElemType, ExtraPropsFix>['type'],
  callback: CascadeToCallbackObject<ElemType, ExtraPropsFix>['callback']
];

export type CascadeToArrayGeneric = any;

export type CascadeToArray<
  CascadeTo extends CascadeAsType,
  ExtraPropsFix extends Record<string, unknown>
> =
  | CascadeTo
  | CascadeToCallbackSingle<CascadeTo, ExtraPropsFix>
  | utils.ArrayUnionReadonlyArray<
      | CascadeTo
      | CascadeToCallbackObject<CascadeTo, ExtraPropsFix>
      | CascadeToCallbackArray<CascadeTo, ExtraPropsFix>
    >;

export type CascadeToPropsInner<T extends CascadeAsType> =
  (keyof JSX.IntrinsicElements)[] extends T[]
    ? never
    : utils.UnionToIntersection<React.PropsWithoutRef<utils.GetProps<T>>>;

export type CascadeToProps<
  T extends CascadeAsType,
  ExtraProps extends Record<string, unknown>
> = CascadeToPropsInner<T> extends never
  ? ExtraProps
  : Omit<ExtraProps, keyof CascadeToPropsInner<T>> & CascadeToPropsInner<T>;

export type CascadeBaseProps<
  ElemType extends CascadeAsType,
  CascadeTo extends CascadeAsType,
  ExtraProps extends Record<string, unknown>
> = {
  as?: ElemType;
  cascadeTo?: CascadeToArray<
    CascadeTo,
    CascadeToProps<CascadeTo, ExtraProps>
  > | null;
  cascadeProps?: CascadeToProps<CascadeTo, ExtraProps>;
  absorbProps?: boolean;
  // passProps?: boolean;
};

export type CascadeAsProps<ElemType extends CascadeAsType> = Omit<
  utils.GetProps<ElemType>,
  keyof CascadeBaseProps<ElemType, any, any>
>;

export type CascadeRef<ElemType extends CascadeAsType> = CascadeProps<
  ElemType,
  any,
  any
> extends { ref: any }
  ? CascadeProps<ElemType, any, any>['ref']
  : any;

export type CascadeToDefault = keyof JSX.IntrinsicElements;

export type CascadeProps<
  ElemType extends CascadeAsType,
  CascadeTo extends CascadeAsType,
  ExtraProps extends Record<string, unknown>
> = CascadeBaseProps<ElemType, CascadeTo, ExtraProps> &
  CascadeAsProps<ElemType>;

function Cascade<
  ExtraProps extends Record<string, unknown> = Record<string, any>,
  CascadeTo extends CascadeAsType = CascadeToDefault,
  ElemType extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = 'div'
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
  }: CascadeProps<ElemType, CascadeTo, ExtraProps>,
  ref: CascadeRef<ElemType>
): JSX.Element {
  if (
    !(cascadeTo === undefined) &&
    !(cascadeTo === null) &&
    !(typeof cascadeTo === 'string') &&
    !(typeof cascadeTo === 'function' && cascadeTo.length === 3) &&
    !Array.isArray(cascadeTo)
  ) {
    throw new TypeError(
      `Expected cascadeTo be of type: undefined, string, function, or array. \n\nReceived: ${utils.displayType(
        cascadeTo
      )}`
    );
  }

  let flattenedCascadeToArray: ParsedCascadeToReturn<
    CascadeAsType,
    CascadeToProps<CascadeTo, ExtraProps>
  >;
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
        cascadeTo:
          E.props.cascadeTo === undefined ? cascadeTo : E.props.cascadeTo,
      };
    }

    if (!cascadeTo) {
      return React.createElement(E.type, props);
    }
    if (cascadeTo === E.type) {
      return React.createElement(E.type, props);
    }
    if (typeof cascadeTo === 'function' && cascadeTo.length === 3) {
      return React.createElement(
        E.type,
        (cascadeTo as CascadeToCallbackSingle<any, any>)(
          E.type,
          cascadeProps,
          E.props
        )
      );
    }
    if (
      (Array.isArray as (arg: any) => arg is any[] | Readonly<any[]>)(cascadeTo)
    ) {
      flattenedCascadeToArray ||= utils.parseCascadeTo<any, any>(cascadeTo);
      const found = flattenedCascadeToArray[0].indexOf(E.type as CascadeAsType);
      if (found !== -1) {
        const callback = flattenedCascadeToArray[1][found];
        return React.createElement(
          E.type,
          callback ? callback(cascadeProps ?? ({} as any), E.props) : props
        );
      }
    }
    return E;
  });

  return React.createElement(as, { ref, ...rest }, ...children);
}

type CascadeFC = <
  ExtraProps extends Record<string, unknown> = Record<string, any>,
  CascadeTo extends CascadeAsType = CascadeToDefault,
  ElemType extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = 'div'
>(
  props: CascadeProps<ElemType, CascadeTo, ExtraProps>
) => JSX.Element;
export const CascadeFC = React.forwardRef(Cascade);

type CascadeIntrinsicElement<ElemType extends keyof JSX.IntrinsicElements> = <
  CascadeTo extends CascadeAsType = CascadeToDefault,
  ExtraProps extends Record<string, unknown> = Record<string, any>
>(
  props: CascadeProps<ElemType, CascadeTo, ExtraProps>
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
