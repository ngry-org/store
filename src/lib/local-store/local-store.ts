import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';
import { StoreBase } from '../store/store-base';

/**
 * Represents base implementation of local store.
 * Local store simplifies component's state management by ejecting it into a separate component-bounded @Injectable class.
 * @since 11.0.0
 * @author Alex Chugaev
 */
export abstract class LocalStore<TState> extends StoreBase<TState> implements OnDestroy {

  ngOnDestroy(): void {
    this.complete();
  }

  protected select<T>(project: (state: TState) => T): Observable<T> {
    return this.state.pipe(
      map(project),
      distinctUntilChanged(),
    );
  }

  protected updater<T = never>(delegate: (state: TState, value: T) => TState): (value: T) => void {
    return (value: T): void => {
      const newState = delegate(this.snapshot, value);

      this.next(newState);
    };
  }

  protected effect<T>(delegate: (value$: Observable<T>) => Observable<unknown>): (value: T) => void {
    const valueSubject = new Subject<T>();

    delegate(valueSubject.pipe(
      takeUntil(this.completeSubject),
    )).subscribe();

    return value => {
      valueSubject.next(value);
    };
  }
}
