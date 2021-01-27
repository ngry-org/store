import { ArrayCompatible, CompareFunction, PredicateFunction } from '../types';

/**
 * Represents an immutable collection of entities.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export abstract class EntityCollection<ID, TEntity, TCollection extends EntityCollection<ID, TEntity, any>>
  implements Iterable<TEntity>, ArrayCompatible<TEntity> {

  /**
   * Gets list of entities IDs.
   * @since 1.0.0
   */
  readonly ids: ReadonlyArray<ID>;

  /**
   * Gets list of entities.
   * @since 1.0.0
   */
  readonly entities: ReadonlyArray<TEntity>;

  /**
   * Gets length of collection.
   * @since 1.0.0
   */
  get length(): number {
    return this.ids.length;
  }

  /**
   * Indicates whether collection is empty or not.
   * @since 1.0.0
   */
  get empty(): boolean {
    return this.ids.length === 0;
  }

  /**
   * Initializes new instance.
   * @param entities Iterable source of entities
   */
  constructor(
    entities: Iterable<TEntity> = [],
  ) {
    const _entities = [...entities].reduce((accumulator, entity) => {
      const index = this.selectId(entity);
      const _index = accumulator.findIndex(_entity => this.selectId(_entity) === index);

      if (_index >= 0) {
        accumulator.splice(_index, 1);
      }

      accumulator.push(entity);

      return accumulator;
    }, [] as Array<TEntity>);

    this.ids = _entities.map(entity => this.selectId(entity));
    this.entities = [..._entities];
  }

  [Symbol.iterator](): Iterator<TEntity> {
    return this.entities[Symbol.iterator]();
  }

  /**
   * Gets an entity by ID.
   * If no entity with such ID found, returns {@link undefined}.
   * @param id Entity ID
   * @since 1.0.0
   */
  get(id: ID): TEntity | undefined {
    const idx = this.ids.indexOf(id);

    return this.entities[idx];
  }

  /**
   * Determines whether this collection has an entity with such ID.
   * @param id Entity ID
   * @since 1.0.0
   */
  has(id: ID): boolean {
    for (const _id of this.ids) {
      if (this.compareIds(_id, id)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determines whether this collection has an entity with the same ID as given one.
   * @param entity Instance of entity
   * @since 1.0.0
   */
  includes(entity: TEntity): boolean {
    return this.has(this.selectId(entity));
  }

  /**
   * Returns new instance of collection with given entity when one didn't include an entity with the same ID.
   * Returns self when already includes an entity with the same ID.
   * @param entity Instance of entity
   * @since 1.0.0
   */
  add(entity: TEntity): TCollection {
    if (this.includes(entity)) {
      return this as unknown as TCollection;
    }

    return this.create(
      [...this.entities, entity],
    );
  }

  /**
   * Returns new instance of collection with given entities when one didn't include any entity with the same ID.
   * Returns self when already includes all entities with the same ID.
   * @param entities Iterable source of entities
   * @since 1.0.0
   */
  addMany(entities: Iterable<TEntity>): TCollection {
    let collection: TCollection = this as unknown as TCollection;

    for (const entity of entities) {
      collection = collection.add(entity);
    }

    return collection;
  }

  /**
   * Returns new instance of collection with given entity instead of one with the same ID.
   * Returns self when collection doesn't include an entity with the same ID.
   * @param entity Instance of entity
   * @since 1.0.0
   */
  update(entity: TEntity): TCollection {
    const index = this.entities.findIndex(_entity => this.compareIds(this.selectId(entity), this.selectId(_entity)));

    if (index >= 0) {
      const entities = [...this.entities];

      entities[index] = entity;

      return this.create(entities);
    }

    return this as unknown as TCollection;
  }

  /**
   * Returns new instance of collection with given entities instead of ones with the same ID.
   * Returns self when collection doesn't include any entity with the same ID.
   * @param entities Iterable source of entities
   * @since 4.0.0
   */
  updateMany(entities: Iterable<TEntity>): TCollection {
    let collection = this as unknown as TCollection;

    for (const entity of entities) {
      collection = collection.update(entity);
    }

    return collection;
  }

  /**
   * Returns new instance of collection with given entity.
   * When collection already includes an entity with the same ID, it will be replaced.
   * When collection doesn't include an entity with the same ID, it will be added.
   * @param entity Instance of entity
   * @since 4.0.0
   */
  set(entity: TEntity): TCollection {
    if (this.includes(entity)) {
      return this.update(entity);
    } else {
      return this.add(entity);
    }
  }

  /**
   * Returns new instance of collection with given entities.
   * When collection already includes an entity with the same ID, it will be replaced.
   * When collection doesn't include an entity with the same ID, it will be added.
   * @param entities Iterable source of entities
   * @since 4.0.0
   */
  setMany(entities: Iterable<TEntity>): TCollection {
    let collection: TCollection = this as unknown as TCollection;

    for (const entity of entities) {
      collection = collection.set(entity);
    }

    return collection;
  }

  /**
   * Returns new collection without entity with given ID when collection includes one.
   * Returns self when doesn't include an entity with given ID.
   * @param id Entity ID
   * @since 1.0.0
   */
  delete(id: ID): TCollection {
    if (this.has(id)) {
      return this.create(
        this.entities.filter(entity => this.selectId(entity) !== id),
      );
    } else {
      return this as unknown as TCollection;
    }
  }

  /**
   * Returns new collection without entities with given IDs when collection includes any.
   * Returns self when doesn't include any entities with given IDs.
   * @param ids Entities IDs
   * @since 1.0.0
   */
  deleteMany(ids: Iterable<ID>): TCollection {
    const entities = this.entities.filter(entity => {
      const entityId = this.selectId(entity);

      for (const id of ids) {
        if (this.compareIds(id, entityId)) {
          return false;
        }
      }

      return true;
    });

    if (this.entities.length === entities.length) {
      return this as unknown as TCollection;
    } else {
      return this.create(entities);
    }
  }

  /**
   * Returns new collection without entity with the same ID when collection includes one.
   * Returns self when doesn't include an entity with the same ID.
   * @param sample Instance of entity
   * @since 1.0.0
   */
  remove(sample: TEntity): TCollection {
    const id: ID = this.selectId(sample);

    return this.delete(id);
  }

  /**
   * Returns new collection without entities with same IDs when collection includes any.
   * Returns self when doesn't include any entities with the same IDs.
   * @param samples Iterable source of entities
   * @since 1.0.0
   */
  removeMany(samples: Iterable<TEntity>): TCollection {
    const ids: Set<ID> = new Set<ID>();

    for (const entity of samples) {
      ids.add(this.selectId(entity));
    }

    return this.deleteMany(ids);
  }

  /**
   * Returns an empty collection when not empty itself.
   * Returns self when already empty.
   * @since 1.0.0
   */
  clear(): TCollection {
    if (this.empty) {
      return this as unknown as TCollection;
    }

    return this.create([]);
  }

  /**
   * Returns new collection with entities matching predicate when predicate didn't match all entities.
   * Returns self when predicate matches all entities.
   * @since 1.0.0
   */
  filter(predicate: PredicateFunction<TEntity>): TCollection {
    const length = this.entities.length;
    const entities = this.entities.filter(entity => predicate(entity));

    if (entities.length === length) {
      return this as unknown as TCollection;
    }

    return this.create(entities);
  }

  /**
   * Returns sorted collection when entities order has changed.
   * Returns self when entities order hasn't changed.
   * @param compare Entity comparison function
   * @since 1.0.0
   */
  sort(compare: CompareFunction<TEntity>): TCollection {
    const entities = [...this.entities].sort(compare);

    for (let i = 0; i < entities.length; i++) {
      const aId = this.selectId(entities[i]);
      const bId = this.selectId(this.entities[i]);

      if (!this.compareIds(aId, bId)) {
        return this.create(entities);
      }
    }

    return this as unknown as TCollection;
  }

  /**
   * Returns an array representation of this collection.
   * @since 1.0.0
   */
  toArray(): Array<TEntity> {
    return [...this.entities];
  }

  /**
   * Create new instance of collection.
   * @param entities Iterable source of entities
   * @since 1.0.0
   */
  protected abstract create(entities: Iterable<TEntity>): TCollection;

  /**
   * Returns an ID of given entity.
   * @param entity Instance of entity
   * @since 1.0.0
   */
  protected abstract selectId(entity: TEntity): ID;

  /**
   * Compares entities IDs for equality.
   * @param a ID of left entity
   * @param b ID of right entity
   * @since 1.0.0
   */
  protected abstract compareIds(a: ID, b: ID): boolean;
}
