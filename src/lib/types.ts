
export type PredicateFunction<T> = (item: T) => boolean;
export type CompareFunction<T> = (a: T, b: T) => number;

export interface ArrayCompatible<T> {
  toArray(): Array<T>;
}
