import { BehaviorSubject, CompletionObserver, NextObserver, Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * Represents base implementation of store.
 * @since 1.0.0
 * @author Alex Chugaev
 */
export abstract class StoreBase<TState> implements NextObserver<TState>, CompletionObserver<TState> {
  protected readonly stateSubject: BehaviorSubject<TState>;
  protected readonly completeSubject = new ReplaySubject<void>(1);

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
    this.completeSubject.next();
  }
}
