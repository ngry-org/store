import { NextObserver, Observable, Subject } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  map,
  publishReplay,
  refCount,
  takeUntil,
} from 'rxjs/operators';
import { Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

class NextCommand<TState> {
  constructor(
    readonly state: TState,
  ) {
  }
}

class UpdateCommand<TState> {
  constructor(
    readonly delegate: (state: TState, ...args: readonly unknown[]) => TState,
    readonly args: readonly unknown[],
  ) {
  }
}

type CommandType<TState> = NextCommand<TState> | UpdateCommand<TState>;

export abstract class RouterStoreBase<TState> implements NextObserver<TState>, OnDestroy {
  private readonly commandSubject = new Subject<CommandType<TState>>();
  private readonly destroySubject = new Subject<void>();
  private readonly route: ActivatedRoute;
  private readonly router: Router;

  readonly closed = false;
  readonly state: Observable<TState>;

  get snapshot(): TState {
    const value = this.route.snapshot.queryParamMap.get(this.paramName);

    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Unable to parse state:', e);

        return this.initial;
      }
    } else {
      return this.initial;
    }
  }

  protected constructor(
    injector: Injector,
    private initial: TState,
    private paramName: string,
  ) {
    this.route = injector.get(ActivatedRoute);
    this.router = injector.get(Router);
    this.state = this.route.queryParams.pipe(
      takeUntil(this.destroySubject),
      distinctUntilKeyChanged(this.paramName),
      map(() => this.snapshot),
      publishReplay(1),
      refCount(),
    );

    this.commandSubject.pipe(
      takeUntil(this.destroySubject),
      concatMap(async command => {
        let state!: TState;

        if (command instanceof NextCommand) {
          state = command.state;
        }

        if (command instanceof UpdateCommand) {
          state = command.delegate(this.snapshot, ...command.args);
        }

        try {
          await this.router.navigate([], {
            queryParams: {
              [this.paramName]: JSON.stringify(state),
            },
          });
        } catch (e) {
          console.error('Navigation error:', e);
        }
      }),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  next(state: TState): void {
    this.commandSubject.next(new NextCommand(state));
  }

  reset(): void {
    this.commandSubject.next(new NextCommand(this.initial));
  }

  /**
   * Creates an optimized stream of values selected from state.
   * @param project Function that selects value from the state
   * @since 5.1.0
   */
  protected select<TValue>(project: (state: TState) => TValue): Observable<TValue> {
    return this.state.pipe(
      map(project),
      distinctUntilChanged(),
    );
  }

  /**
   * Creates method that updates state.
   * @param delegate Function that calculates a new state from current one and a set of arguments.
   * @since 5.0.0
   */
  protected updater<TArgs extends readonly unknown[] = unknown[]>(
    delegate: (state: TState, ...args: TArgs) => TState,
  ): (...args: TArgs) => void {
    return (...args: TArgs): void => {
      this.commandSubject.next(
        new UpdateCommand(delegate as (state: TState, ...args: readonly unknown[]) => TState, args),
      );
    };
  }
}
