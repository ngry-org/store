import { BehaviorSubject, CompletionObserver, NextObserver, Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export abstract class StoreBase<TState> implements NextObserver<TState>, CompletionObserver<TState> {
  protected readonly stateSubject: BehaviorSubject<TState>;
  protected readonly completeSubject = new ReplaySubject<void>(1);

  get closed(): boolean {
    return this.stateSubject.closed;
  }

  get snapshot(): TState {
    return this.stateSubject.value;
  }

  /**
   * Gets stream of state.
   * @since 11.0.0
   */
  readonly state: Observable<TState>;

  protected constructor(
    initial: TState,
  ) {
    this.stateSubject = new BehaviorSubject(initial);
    this.state = this.stateSubject.pipe(
      distinctUntilChanged(),
    );
  }

  next(state: TState): void {
    this.stateSubject.next(state);
  }

  complete(): void {
    this.stateSubject.complete();
    this.completeSubject.next();
  }
}
