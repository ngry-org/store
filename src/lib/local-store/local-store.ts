import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';
import { StoreBase } from '../store/store-base';

/**
 * Represents base implementation of local store.
 * Local store simplifies component's state management by ejecting it into a separate component-bounded @Injectable class.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export abstract class LocalStore<TState> extends StoreBase<TState> implements OnDestroy {

  ngOnDestroy(): void {
    this.complete();
  }

  /**
   * Creates an optimized stream of values selected from state.
   * @param project Function that selects value from the state
   * @since 1.0.0
   * @protected
   */
  protected select<T>(project: (state: TState) => T): Observable<T> {
    return this.state.pipe(
      map(project),
      distinctUntilChanged(),
    );
  }

  /**
   * Creates method that updates state.
   * @param delegate Function that produces new state based on current one and value
   * @since 1.0.0
   * @protected
   */
  protected updater<T = never>(delegate: (state: TState, value: T) => TState): (value: T) => void {
    return value => {
      const newState = delegate(this.snapshot, value);

      this.next(newState);
    };
  }

  /**
   * Creates method that performs sync or async side effect(s).
   * @param delegate Function that creates reactive pipeline which triggers on value pushes.
   * @since 1.0.0
   * @protected
   */
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
