
/**
 * Determines whether an item matching predicate.
 * @since 1.0.0
 * @see {EntityCollection.filter}
 * @see {EntityCollectionStore.filter}
 * @author Alex Chugaev
 */
export type PredicateFunction<T> = (item: T) => boolean;

/**
 * Compares two items.
 * @since 1.0.0
 * @see {EntityCollection.sort}
 * @see {EntityCollectionStore.sort}
 * @author Alex Chugaev
 */
export type CompareFunction<T> = (a: T, b: T) => number;

/**
 * Provides compatibility with built-in {@link Array} type.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export interface ArrayCompatible<T> {
  /**
   * Returns {@link Array} representation of type implementing this interface.
   * @since 1.0.0
   */
  toArray(): Array<T>;
}
