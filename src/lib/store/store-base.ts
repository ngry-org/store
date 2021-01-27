import { BehaviorSubject, CompletionObserver, NextObserver, Observable, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

/**
 * Represents base implementation of store.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export abstract class StoreBase<TState> implements NextObserver<TState>, CompletionObserver<TState>, OnDestroy {
  private readonly stateSubject: BehaviorSubject<TState>;
  private readonly completeSubject = new ReplaySubject<void>(1);

  /**
   * Indicates whether state subject is closed.
   * @since 1.0.0
   */
  get closed(): boolean {
    return this.stateSubject.closed;
  }

  /**
   * Gets immediate state snapshot.
   * @since 1.0.0
   */
  get snapshot(): TState {
    return this.stateSubject.value;
  }

  /**
   * Gets stream of state.
   * @since 1.0.0
   */
  readonly state: Observable<TState>;

  /**
   * Initializes new instance.
   * @param initial Initial state
   * @protected
   */
  protected constructor(
    initial: TState,
  ) {
    this.stateSubject = new BehaviorSubject(initial);
    this.state = this.stateSubject.pipe(
      distinctUntilChanged(),
    );
  }

  /**
   * Completes state subject and cancels related streams, ie. effects.
   * @since 5.0.0
   */
  ngOnDestroy(): void {
    this.complete();
  }

  /**
   * Pushes next state.
   * @param state Next state
   * @since 1.0.0
   */
  next(state: TState): void {
    this.stateSubject.next(state);
  }

  /**
   * Completes state stream.
   * @since 1.0.0
   */
  complete(): void {
    this.stateSubject.complete();
    this.stateSubject.unsubscribe();
    this.completeSubject.next();
  }

  /**
   * Creates an optimized stream of values selected from state.
   * @param project Function that selects value from the state
   * @since 5.0.0
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
   * @since 5.0.0
   */
  protected updater<TValue = never>(delegate: (state: TState, value: TValue) => TState): (value: TValue) => void {
    return value => {
      const oldState = this.snapshot;
      const newState = delegate(this.snapshot, value);

      if (oldState !== newState) {
        this.next(newState);
      }
    };
  }

  /**
   * Creates method that performs sync or async side effect(s).
   * @param delegate Function that creates reactive pipeline which triggers on value pushes.
   * @since 5.0.0
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
