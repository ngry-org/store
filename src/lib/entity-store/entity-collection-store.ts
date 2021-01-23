import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';
import { StoreBase } from '../store/store-base';
import { CompareFunction, PredicateFunction } from '../types';
import { EntityCollection } from './entity-collection';

export class EntityCollectionStore<ID, TEntity, TCollection extends EntityCollection<ID, TEntity, any>>
  extends StoreBase<TCollection> implements OnDestroy {

  readonly ids: Observable<ReadonlyArray<ID>>;
  readonly entities: Observable<ReadonlyArray<TEntity>>;
  readonly length: Observable<number>;
  readonly empty: Observable<boolean>;

  constructor(
    initial: TCollection,
  ) {
    super(initial);

    this.ids = this.state.pipe(
      map(collection => collection.ids),
      distinctUntilChanged(),
    );

    this.entities = this.state.pipe(
      map(collection => collection.entities),
      distinctUntilChanged(),
    );

    this.length = this.state.pipe(
      map(collection => collection.length),
      distinctUntilChanged(),
    );

    this.empty = this.state.pipe(
      map(collection => collection.empty),
      distinctUntilChanged(),
    );
  }

  ngOnDestroy(): void {
    this.complete();
  }

  add(entity: TEntity): void {
    this.next(this.snapshot.add(entity));
  }

  addMany(entities: Iterable<TEntity>): void {
    this.next(this.snapshot.addMany(entities));
  }

  update(entity: TEntity): void {
    this.next(this.snapshot.update(entity));
  }

  updateMany(entities: Iterable<TEntity>): void {
    this.next(this.snapshot.updateMany(entities));
  }

  set(entity: TEntity): void {
    this.next(this.snapshot.set(entity));
  }

  setMany(entities: Iterable<TEntity>): void {
    this.next(this.snapshot.setMany(entities));
  }

  delete(id: ID): void {
    this.next(this.snapshot.delete(id));
  }

  deleteMany(ids: Iterable<ID>): void {
    this.next(this.snapshot.deleteMany(ids));
  }

  remove(entity: TEntity): void {
    this.next(this.snapshot.remove(entity));
  }

  removeMany(entities: Iterable<TEntity>): void {
    this.next(this.snapshot.removeMany(entities));
  }

  clear(): void {
    this.next(this.snapshot.clear());
  }

  filter(predicate: PredicateFunction<TEntity>): void {
    this.next(this.snapshot.filter(predicate));
  }

  sort(compare: CompareFunction<TEntity>): void {
    this.next(this.snapshot.sort(compare));
  }
}
