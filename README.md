[![build](https://github.com/ngry-project/store/workflows/build/badge.svg?branch=master)](https://github.com/ngry-project/store/actions?query=workflow%3Abuild)
[![unit-tests](https://github.com/ngry-project/store/workflows/unit-tests/badge.svg?branch=master)](https://github.com/ngry-project/store/actions?query=workflow%3Aunit-tests)
[![code-style](https://github.com/ngry-project/store/workflows/code-style/badge.svg?branch=master)](https://github.com/ngry-project/store/actions?query=workflow%3Acode-style)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ngry-project/store?logo=github)](https://github.com/ngry-project/store/releases)
[![npm (scoped)](https://img.shields.io/npm/v/@ngry/store?logo=npm)](https://www.npmjs.com/package/@ngry/store)
[![Coveralls github](https://img.shields.io/coveralls/github/ngry-project/store?logo=jest)](https://coveralls.io/github/ngry-project/store)

## Installation

Install the package:

```bash
npm i @ngry/store
```

Optionally, install [`@ngry/rx`](https://www.npmjs.com/package/@ngry/rx) for useful operators like `ofType`
and `dispatch`:

```bash
npm i @ngry/rx
```

## Global store

**Store** is a container of shared state(s).

Design state in a form of an _immutable_ class and decorate action handlers with `@On()` decorator.

💡 Convention: action handlers MUST produce new state or return the current one.

```ts
import { On } from '@ngry/store';

class CartItem {
  constructor(
    readonly productId: number,
    readonly quantity: number,
  ) {
  }
}

class CartState {
  constructor(
    readonly loading = false,
    readonly items: ReadonlyArray<CartItem> = [],
    readonly error?: Error,
  ) {
  }

  put(item: CartItem): CartState {
    return new CartState(this.loading, [...this.items, item], this.error);
  }

  withLoading(loading: boolean): CartState {
    return new CartState(loading, this.items, this.error);
  }

  withItems(items: Array<CartItem>): CartState {
    return new CartState(this.loading, items, this.error);
  }

  withError(error: Error | undefined): CartState {
    return new CartState(this.loading, this.items, error);
  }

  // 👇 Decorate action handlers with @On decorator.
  //    Action handlers MUST produce new state or return the current one.

  @On(Load)
  onLoad(): CartState {
    return this.withLoading(true).withItems([]).withError(undefined);
  }

  @On(Loaded)
  onLoaded(action: Loaded): CartState {
    return this.withLoading(false).withItems(action.items);
  }

  @On(Failed)
  onFailed(action: Failed): CartState {
    return this.withLoading(false).withError(action.error);
  }

  @On(Put)
  onPut(action: Put): CartState {
    return this.put(action.item);
  }
}
```

Design actions in a form of plain classes.

💡 Convention: please avoid string literals to declare action types.

```ts
class Load {
}

class Loaded {
  constructor(
    readonly items: Array<CartItem>,
  ) {
  }
}

class Failed {
  constructor(
    readonly error: Error,
  ) {
  }
}

class Put {
  constructor(
    readonly item: CartItem,
  ) {
  }
}
```

Use `StoreModule.forFeature` method to build a dynamic module from state provider(s).

`StoreModule.forFeature` receives a list of state providers.

```ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngry/store';
import { CartState } from './cart.state';

@NgModule({
  imports: [
    StoreModule.forFeature([
      {
        useFactory(): CartState {
          // 👇 You decide how to create initial state.
          //    For example, you can fetch it from `localStorage`.
          return new CartState();
        },
      },
    ]),
  ],
})
class CartModule {
}
```

To consume the state, `select` it from the store.

```ts
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngry/store';
import { CartState } from './cart.state';

@Component()
class CartComponent implements OnInit {
  readonly state: Observable<CartState>;

  constructor(
    readonly store: Store,
  ) {
    // 👇 Select specific state from store
    this.state = store.select(CartState);
  }

  ngOnInit() {
    // 👇 Dispatch (trigger) the action
    this.store.dispatch(new Load());
  }
}
```

## Effects

**Effects** let you isolate side effects like HTTP requests into separate class.

Design actions in a form of simple classes.

```ts
class Load {
  constructor(
    readonly id: number,
  ) {
  }
}

class Loaded {
  constructor(
    readonly result: number,
  ) {
  }
}
```

Effects often delegate some async work to service layer.

```ts
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
class TestService {
  get(id: number): Observable<number> {
    return of(id + 1);
  }
}
```

Design custom effects providers by extending `EffectsProvider`.

In its nutshell, effects provider is just a collection of action streams.

In most cases you will use `Actions` provider as a source of actions.

```ts
import { map, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, EffectsProvider } from '@ngry/store';
import { dispatch, ofType } from '@ngry/rx';

@Injectable({
  providedIn: 'root'
})
class TestEffects extends EffectsProvider {
  constructor(
    // 👇 Actions is a global (provided in root) stream of actions
    actions: Actions,
    service: TestService,
  ) {
    super([
      actions.pipe(
        ofType(Load),
        switchMap(action => service.get(action.id)),
        map(result => new Loaded(result)),
      ),

      actions.pipe(
        ofType(Load),
        tap(action => {
          // Perform some side effects. For example, push notification.
        }),
        // Break circular dispatching of Load action
        dispatch(false),
      ),
    ]);
  }
}
```

Register effects providers with feature module:

```ts
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngry/store';

@NgModule({
  imports: [
    EffectsModule.forFeature([
      TestEffects,
    ]),
  ],
})
class MyFeatureModule {
}
```

## Abstract store

You can build stores in less verbose manner using abstract `StoreBase` class.

Design state in a form of _immutable_ class:

```ts
class CheckboxState {
  constructor(
    readonly checked = false,
    readonly disabled = false,
  ) {
  }

  setChecked(checked: boolean): CheckboxState {
    if (this.checked !== checked) {
      return new CheckboxState(checked, this.disabled);
    }

    return this;
  }

  setDisabled(disabled: boolean): CheckboxState {
    if (this.disabled !== disabled) {
      return new CheckboxState(this.checked, disabled);
    }

    return this;
  }
}
```

Create custom store by extending `StoreBase<TState, TAction>` class:

```ts
import { Observable } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { StoreBase } from '@ngry/store';

@Injectable()
class CheckboxStore extends StoreBase<CheckboxState> {
  readonly checked$ = this.select(state => state.checked);
  readonly disabled$ = this.select(state => state.disabled);

  constructor() {
    super(new CheckboxState());
  }

  readonly setChecked = this.effect((value$: Observable<boolean>) => {
    return value$.pipe(
      delay(1),
      switchMap(value => {
        return this.state.pipe(
          map(state => state.setChecked(value)),
          tap(state => this.next(state)),
        );
      }),
    );
  });

  public setDisabled = this.updater((state, disabled: boolean) => {
    return state.setDisabled(disabled);
  });
}
```

## Entity Store

**Entity store** is a convenient way to manage a list of entities (objects with identity).

Design the entity in a form of _immutable_ class or interface.

```ts
class House {
  constructor(
    readonly id: number,
  ) {
  }
}
```

Create collection class by extending `EntityCollection<ID, TEntity>`. It gives a bunch of useful methods to manage
collection of entities in _immutable_ way.

```ts
import { EntityCollection } from '@ngry/store';

class HouseCollection extends EntityCollection<number, House, HouseCollection> {
  protected selectId(house: House): number {
    return house.id;
  }

  protected create(entities: Iterable<House>): HouseCollection {
    return new HouseCollection(entities);
  }

  protected compareIds(a: number, b: number): boolean {
    return a === b;
  }
}
```

Create store of entity collection by extending `EntityCollectionStore<ID, TEntity, TCollection>`.

```ts
import { Injectable } from '@angular/core';
import { EntityCollectionStore } from '@ngry/store';

@Injectable()
class HouseCollectionStore extends EntityCollectionStore<number, House, HouseCollection> {
  constructor() {
    super(new HouseCollection());
  }
}
```

To consume the store data inject the store in your component:

```ts
import { Component } from '@angular/core';

@Component()
class HouseCollectionComponent {
  constructor(
    readonly store: HouseCollectionStore,
  ) {
  }
}
```

## License

MIT
