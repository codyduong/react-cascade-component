import {
  CascadeAsType,
  CascadeToArray,
  CascadeToCallbackObject,
  CascadeToProps,
  CascadeToDefault,
} from '../Cascade';

export type ParsedCascadeToReturn<
  CascadeTo extends CascadeAsType,
  ExtraPropsFix extends Record<string, unknown>
> = Readonly<
  [
    CascadeAsType[],
    CascadeToCallbackObject<CascadeTo, ExtraPropsFix>['callback'][]
  ]
>;

export function parseCascadeTo<
  CascadeTo extends CascadeAsType = CascadeToDefault,
  ExtraProps extends Record<string, unknown> = Record<string, any>
>(
  cascadeTo: CascadeToArray<
    CascadeTo,
    CascadeToProps<CascadeAsType, ExtraProps>
  >
): ParsedCascadeToReturn<CascadeTo, CascadeToProps<CascadeTo, ExtraProps>> {
  if (!Array.isArray(cascadeTo)) {
    throw new TypeError('Expected array type');
  }
  const typeArray: any = [];
  const callbackArray: any = [];
  for (const e of cascadeTo) {
    if (
      (Array.isArray as (a: any) => a is any[] | Readonly<any[]>)(e) ||
      (typeof e === 'object' &&
        e !== null &&
        !('$$typeof' in e || 'render' in e))
    ) {
      const length = Array.isArray(e) ? e.length : 2;
      if (length !== 2) {
        console.error(
          // @ts-expect-error: If typed correctly, we should expect e is `never` type
          `More values received than expected. Expected: 2, Received ${e.length}`
        );
      } else {
        const [type, callback] = (
          Array.isArray as (a: any) => a is any[] | Readonly<any[]>
        )(e)
          ? e
          : [e.type, e.callback];
        if (
          ((typeof type === 'string' ||
            (typeof type === 'function' && type.length === 1)) &&
            typeof callback === 'function' &&
            callback.length === 2) ||
          callback === undefined ||
          callback === null
        ) {
          typeArray.push(type);
          callbackArray.push(callback);
        } else {
          console.error(`There was an issue parsing the type`);
        }
      }
    } else {
      if (
        typeof e === 'string' ||
        (typeof e === 'function' && e.length === 1) ||
        (typeof e === 'object' && ('render' in e || '$$typeof' in e))
      ) {
        typeArray.push(e);
        callbackArray.push(undefined);
      } else {
        console.error(
          `Unexpected type in cascadeTo array, expected one of React Component or JSX intrinsic element.\n\nReceived: ${
            cascadeTo === null ? 'null' : typeof cascadeTo
          }`
        );
      }
    }
  }
  return [typeArray, callbackArray];
}
