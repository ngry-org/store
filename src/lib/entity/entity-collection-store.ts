import { Observable } from 'rxjs';
import { StoreBase } from '../store/store-base';
import { CompareFunction, PredicateFunction } from '../types';
import { EntityCollection } from './entity-collection';

/**
 * Represents a store of {@link EntityCollection}.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export class EntityCollectionStore<ID, TEntity, TCollection extends EntityCollection<ID, TEntity, any>>
  extends StoreBase<TCollection> {

  /**
   * Gets stream of entities IDs.
   * @since 1.0.0
   */
  readonly ids: Observable<ReadonlyArray<ID>>;

  /**
   * Gets stream of entities.
   * @since 1.0.0
   */
  readonly entities: Observable<ReadonlyArray<TEntity>>;

  /**
   * Gets stream of entities count.
   * @since 4.0.0
   */
  readonly length: Observable<number>;

  /**
   * Gets stream of empty state changes.
   * @since 4.0.0
   */
  readonly empty: Observable<boolean>;

  /**
   * Initializes new instance.
   * @param initial Initial state
   */
  constructor(
    initial: TCollection,
  ) {
    super(initial);

    this.ids = this.select(collection => collection.ids);
    this.entities = this.select(collection => collection.entities);
    this.length = this.select(collection => collection.length);
    this.empty = this.select(collection => collection.empty);
  }

  /**
   * Emits new instance of collection with given entity when one didn't include an entity with the same ID.
   * @param entity Instance of entity
   * @since 1.0.0
   */
  add(entity: TEntity): void {
    this.next(this.snapshot.add(entity));
  }

  /**
   * Emits new instance of collection with given entities when one didn't include any entity with the same ID.
   * @param entities Iterable source of entities
   * @since 1.0.0
   */
  addMany(entities: Iterable<TEntity>): void {
    this.next(this.snapshot.addMany(entities));
  }

  /**
   * Emits new instance of collection with given entity instead of one with the same ID.
   * @param entity Instance of entity
   * @since 1.0.0
   */
  update(entity: TEntity): void {
    this.next(this.snapshot.update(entity));
  }

  /**
   * Emits new instance of collection with given entities instead of ones with the same ID.
   * @param entities Iterable source of entities
   * @since 4.0.0
   */
  updateMany(entities: Iterable<TEntity>): void {
    this.next(this.snapshot.updateMany(entities));
  }

  /**
   * Emits new instance of collection with given entity.
   * When collection already includes an entity with the same ID, it will be replaced.
   * When collection doesn't include an entity with the same ID, it will be added.
   * @param entity Instance of entity
   * @since 4.0.0
   */
  set(entity: TEntity): void {
    this.next(this.snapshot.set(entity));
  }

  /**
   * Emits new instance of collection with given entities.
   * When collection already includes an entity with the same ID, it will be replaced.
   * When collection doesn't include an entity with the same ID, it will be added.
   * @param entities Iterable source of entities
   * @since 4.0.0
   */
  setMany(entities: Iterable<TEntity>): void {
    this.next(this.snapshot.setMany(entities));
  }

  /**
   * Emits new collection without entity with given ID when collection includes one.
   * @param id Entity ID
   * @since 1.0.0
   */
  delete(id: ID): void {
    this.next(this.snapshot.delete(id));
  }

  /**
   * Emits new collection without entities with given IDs when collection includes any.
   * @param ids Entities IDs
   * @since 1.0.0
   */
  deleteMany(ids: Iterable<ID>): void {
    this.next(this.snapshot.deleteMany(ids));
  }

  /**
   * Emits new collection without entity with the same ID when collection includes one.
   * @param sample Instance of entity
   * @since 1.0.0
   */
  remove(sample: TEntity): void {
    this.next(this.snapshot.remove(sample));
  }

  /**
   * Emits new collection without entities with same IDs when collection includes any.
   * @param samples Iterable source of entities
   * @since 1.0.0
   */
  removeMany(samples: Iterable<TEntity>): void {
    this.next(this.snapshot.removeMany(samples));
  }

  /**
   * Emits an empty collection when not empty itself.
   * @since 1.0.0
   */
  clear(): void {
    this.next(this.snapshot.clear());
  }

  /**
   * Emits new collection with entities matching predicate when predicate didn't match all entities.
   * @since 1.0.0
   */
  filter(predicate: PredicateFunction<TEntity>): void {
    this.next(this.snapshot.filter(predicate));
  }

  /**
   * Emits sorted collection when entities order has changed.
   * @param compare Entity comparison function
   * @since 1.0.0
   */
  sort(compare: CompareFunction<TEntity>): void {
    this.next(this.snapshot.sort(compare));
  }
}
