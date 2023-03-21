import {
  CascadeAsType,
  CascadeToArray,
  CascadeToCallbackObject,
  CascadeToProps,
  CascadeToDefault,
} from '../Cascade';
import { displayType } from './displayType';

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
  if (cascadeTo.length < 1) {
    console.error('Expected at least 1 element to cascadeTo');
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
      const length: number = Array.isArray(e) ? e.length : 2;
      if (length === 0 || length > 2) {
        console.error(
          `Invalid number of values received. Expected: 1 or 2, Received ${
            // @ts-expect-error: e is never
            e.length
          } on ${JSON.stringify(e)}`
        );
      } else {
        const [type, callback] = (
          Array.isArray as (a: any) => a is any[] | Readonly<any[]>
        )(e)
          ? e
          : [e.type, e.callback];
        if (
          type &&
          (typeof type === 'string' ||
            (typeof type === 'function' && type.length === 1) ||
            (typeof type === 'object' &&
              ('render' in type || '$$typeof' in type))) &&
          ((typeof callback === 'function' && callback.length === 2) ||
            callback === undefined ||
            callback === null)
        ) {
          typeArray.push(type);
          callbackArray.push(callback);
        } else {
          console.error(
            `Unparseable type in cascadeTo array.\n\nReceived: ${displayType(
              e
            )}`
          );
        }
      }
    } else {
      if (
        e &&
        (typeof e === 'string' ||
          (typeof e === 'function' && e.length === 1) ||
          (typeof e === 'object' && ('render' in e || '$$typeof' in e)))
      ) {
        typeArray.push(e);
        callbackArray.push(undefined);
      } else {
        console.error(
          `Unexpected type in cascadeTo array, expected one of React Component or JSX intrinsic element.\n\nReceived: ${displayType(
            e
          )}`
        );
      }
    }
  }
  return [typeArray, callbackArray];
}
