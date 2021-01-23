import { ArrayCompatible, CompareFunction, PredicateFunction } from '../types';

/**
 * Represents immutable collection of entities.
 */
export abstract class EntityCollection<ID, TEntity, TCollection extends EntityCollection<ID, TEntity, any>>
  implements Iterable<TEntity>, ArrayCompatible<TEntity> {

  readonly ids: ReadonlyArray<ID>;
  readonly entities: ReadonlyArray<TEntity>;

  get length(): number {
    return this.ids.length;
  }

  get empty(): boolean {
    return this.ids.length === 0;
  }

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

  get(id: ID): TEntity | undefined {
    const idx = this.ids.indexOf(id);

    return this.entities[idx];
  }

  has(id: ID): boolean {
    for (const _id of this.ids) {
      if (this.compareIds(_id, id)) {
        return true;
      }
    }

    return false;
  }

  includes(entity: TEntity): boolean {
    return this.has(this.selectId(entity));
  }

  add(entity: TEntity): TCollection {
    if (this.includes(entity)) {
      return this as unknown as TCollection;
    }

    return this.create(
      [...this.entities, entity],
    );
  }

  addMany(entities: Iterable<TEntity>): TCollection {
    let collection: TCollection = this as unknown as TCollection;

    for (const entity of entities) {
      collection = collection.add(entity);
    }

    return collection;
  }

  update(entity: TEntity): TCollection {
    const index = this.entities.findIndex(_entity => this.compareIds(this.selectId(entity), this.selectId(_entity)));

    if (index >= 0) {
      const entities = [...this.entities];

      entities[index] = entity;

      return this.create(entities);
    }

    return this as unknown as TCollection;
  }

  updateMany(entities: Iterable<TEntity>): TCollection {
    let collection = this as unknown as TCollection;

    for (const entity of entities) {
      collection = collection.update(entity);
    }

    return collection;
  }

  set(entity: TEntity): TCollection {
    if (this.includes(entity)) {
      return this.update(entity);
    } else {
      return this.add(entity);
    }
  }

  setMany(entities: Iterable<TEntity>): TCollection {
    let collection: TCollection = this as unknown as TCollection;

    for (const entity of entities) {
      collection = collection.set(entity);
    }

    return collection;
  }

  delete(id: ID): TCollection {
    if (this.has(id)) {
      return this.create(
        this.entities.filter(entity => this.selectId(entity) !== id),
      );
    } else {
      return this as unknown as TCollection;
    }
  }

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

  remove(entity: TEntity): TCollection {
    const id: ID = this.selectId(entity);

    return this.delete(id);
  }

  removeMany(entities: Iterable<TEntity>): TCollection {
    const ids: Set<ID> = new Set<ID>();

    for (const entity of entities) {
      ids.add(this.selectId(entity));
    }

    return this.deleteMany(ids);
  }

  clear(): TCollection {
    if (this.empty) {
      return this as unknown as TCollection;
    }

    return this.create([]);
  }

  filter(predicate: PredicateFunction<TEntity>): TCollection {
    const length = this.entities.length;
    const entities = this.entities.filter(entity => predicate(entity));

    if (entities.length === length) {
      return this as unknown as TCollection;
    }

    return this.create(entities);
  }

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

  toArray(): Array<TEntity> {
    return [...this.entities];
  }

  protected abstract create(entities: Iterable<TEntity>): TCollection;

  protected abstract selectId(entity: TEntity): ID;

  protected abstract compareIds(a: ID, b: ID): boolean;
}
