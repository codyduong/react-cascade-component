export type UnionToIntersection<Union> = (
  Union extends unknown ? (distributedUnion: Union) => void : never
) extends (mergedIntersection: infer Intersection) => void
  ? Intersection
  : never;

export type GetProps<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends React.JSXElementConstructor<infer P>
  ? P
  : Record<string, unknown>;

export type ArrayUnionReadonlyArray<T> = Array<T> | ReadonlyArray<T>;
export type UnionReadonly<T> = T | Readonly<T>;
