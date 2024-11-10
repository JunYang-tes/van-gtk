//https://github.com/microsoft/TypeScript/issues/32164#issuecomment-2397164975
type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;

export type OverloadUnionRecursive<TOverload, TPartialOverload = unknown> = TOverload extends (
  ...args: infer TArgs
) => infer TReturn
  ? // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures.
    TPartialOverload extends TOverload
    ? never
    :
        | OverloadUnionRecursive<
            TPartialOverload & TOverload,
            TPartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<TOverload>
          >
        | ((...args: TArgs) => TReturn)
  : never;

export type OverloadUnion<TOverload extends (...args: any[]) => any> = Exclude<
  OverloadUnionRecursive<
    // The "() => never" signature must be hoisted to the "front" of the
    // intersection, for two reasons: a) because recursion stops when it is
    // encountered, and b) it seems to prevent the collapse of subsequent
    // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
    // which gives a direct conversion to a union.
    (() => never) & TOverload
  >,
  TOverload extends () => never ? never : () => never
>;
// Inferring a union of parameter tuples or return types is now possible.
export type OverloadParameters<T extends (...args: any[]) => any> = Parameters<OverloadUnion<T>>;

export type UnionToIntersection<U> = 
  (U extends any ? (x: U)=>void : never) extends ((x: infer I)=>void) ? I : never
