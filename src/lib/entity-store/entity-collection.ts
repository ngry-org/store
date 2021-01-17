import { ArrayCompatible, CompareFunction, PredicateFunction } from '../types';

/**
 * Represents immutable collection of entities.
 */
// tslint:disable-next-line:max-line-length
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
      const idx = accumulator.findIndex(_entity => this.selectId(_entity) === this.selectId(entity));

      if (idx >= 0) {
        accumulator.splice(idx, 1);
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
    for (const _ of this.ids) {
      if (this.compareIds(_, id)) {
        return true;
      }
    }

    return false;
  }

  includes(entity: TEntity): boolean {
    return this.has(this.selectId(entity));
  }

  add(entity: TEntity): TCollection {
    return this.create(
      [...this.entities, entity],
    );
  }

  addMany(entities: Iterable<TEntity>): TCollection {
    let empty = true;

    for (const _ of entities) {
      empty = false;
      break;
    }

    if (empty) {
      return this as unknown as TCollection;
    }

    return this.create(
      [...this.entities, ...entities],
    );
  }

  insert(position: number, entity: TEntity): TCollection {
    const before = this.entities.slice(0, position);
    const after = this.entities.slice(position);

    return this.create(
      [...before, entity, ...after],
    );
  }

  insertMany(position: number, entities: Iterable<TEntity>): TCollection {
    let empty = true;

    for (const _ of entities) {
      empty = false;
      break;
    }

    if (empty) {
      return this as unknown as TCollection;
    }

    const before = this.entities.slice(0, position);
    const after = this.entities.slice(position);

    return this.create(
      [...before, ...entities, ...after],
    );
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
    const ids: Array<ID> = [];

    for (const entity of entities) {
      ids.push(this.selectId(entity));
    }

    return this.deleteMany(ids);
  }

  clear(): TCollection {
    return this.create([]);
  }

  update(entity: TEntity): TCollection {
    const id = this.selectId(entity);
    const index = this.entities.findIndex(_entity => {
      const _id = this.selectId(_entity);

      return this.compareIds(id, _id);
    });

    if (index >= 0) {
      const entities = [...this.entities];

      entities[index] = entity;

      return this.create(entities);
    }

    return this as unknown as TCollection;
  }

  filter(predicate: PredicateFunction<TEntity>): TCollection {
    return this.create(this.entities.filter(entity => predicate(entity)));
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
