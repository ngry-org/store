[![build](https://github.com/ngry-project/store/workflows/build/badge.svg?branch=master)](https://github.com/ngry-project/store/actions?query=workflow%3Abuild)
[![unit-tests](https://github.com/ngry-project/store/workflows/unit-tests/badge.svg?branch=master)](https://github.com/ngry-project/store/actions?query=workflow%3Aunit-tests)
[![code-style](https://github.com/ngry-project/store/workflows/code-style/badge.svg?branch=master)](https://github.com/ngry-project/store/actions?query=workflow%3Acode-style)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ngry-project/store?logo=github)](https://github.com/ngry-project/store/releases)
[![npm (scoped)](https://img.shields.io/npm/v/@ngry/store?logo=npm)](https://www.npmjs.com/package/@ngry/store)
[![Coveralls github](https://img.shields.io/coveralls/github/ngry-project/store?logo=jest)](https://coveralls.io/github/ngry-project/store)

## Installation

Using NPM:

```bash
npm i @ngry/store
```

Using Yarn:

```bash
yarn add @ngry/store
```

## Store

**Store** provides access to the pool of states of shared features. In simpler words it's a container of shared state.

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

  append(item: CartItem): CartState {
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
    return this.append(action.item);
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
  ]
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

## Feature Store

**Feature store** lets you create more atomic stores for concrete features.

As in case with global store, everything starts with state and actions design.

Design state in a form of an _immutable_ class and decorate action handlers with `@On()` decorator.

💡 Convention: action handlers MUST produce new state or return the current one.

```ts
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

  append(item: CartItem): CartState {
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

  @On(Put)
  onPut(action: Put): CartState {
    return this.append(action.item);
  }

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

Declare your custom store by extending the `FeatureStore<TState, TAction>`.

Custom feature stores MUST be `@Injectable`.

```ts
@Injectable({
  providedIn: 'root',
})
class CartStore extends FeatureStore<CartState, Load | Loaded | Failed | Put> {
  constructor() {
    super(new CartState());
  }
}
```

To consume the state, inject your feature store to `subscribe` for `state` changes and `dispatch` actions.

```ts
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CartState } from './cart.state';

@Component()
class CartComponent implements OnInit {
  readonly state: Observable<CartState>;

  constructor(
    readonly store: CartStore,
  ) {
    // 👇 Subscribe for state changes
    this.state = store.state;
  }

  ngOnInit() {
    // 👇 Dispatch (trigger) the action
    this.store.dispatch(new Load());
  }
}
```

## Local Store

**Local store** is a convenient way to create component-bounded store and eject data-management logic from component
code.

Design state in a form of _immutable_ class(es).

```ts
import { EntityCollection } from '@ngry/store';

class CartItem {
  get totalPrice(): number {
    return this.quantity * this.price;
  }

  constructor(
    readonly productId: number,
    readonly quantity: number,
    readonly price: number,
  ) {
  }

  increment(quantity: number): CartItem {
    return new CartItem(
      this.productId,
      this.quantity + quantity,
      this.price,
    );
  }
}

class CartItemCollection extends EntityCollection<number, CartItem, CartItemCollection> {
  protected create(entities: Iterable<CartItem>): CartItemCollection {
    return new CartItemCollection(entities);
  }

  protected compareIds(a: number, b: number): boolean {
    return a === b;
  }

  protected selectId(entity: CartItem): number {
    return entity.productId;
  }
}

class Cart {
  get totalPrice(): number {
    return this.items.entities.reduce((totalPrice, item) => {
      return totalPrice + item.totalPrice;
    }, 0);
  }

  constructor(
    readonly items: CartItemCollection = new CartItemCollection(),
  ) {
  }

  put(item: CartItem): Cart {
    return new Cart(
      this.items.includes(item) ?
        this.items.update(item.increment(item.quantity)) :
        this.items.add(item),
    );
  }
}
```

You MAY have some service to use in store as well.

```ts
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
class CartService {
  save(cart: Cart): Observable<Cart> {
    return of(cart);
  }
}
```

Design you custom store by extending `LocalStore<TState>` and providing selectors, updaters and effects.

```ts
import { Injectable } from '@angular/core';
import { LocalStore } from '@ngry/store';

@Injectable()
class CartStore extends LocalStore<Cart> {

  constructor(
    private service: CartService,
  ) {
    super(new Cart());
  }

  readonly totalPrice = this.select(cart => cart.totalPrice);
  readonly items = this.select(cart => cart.items);

  readonly put = this.updater((cart, item: CartItem) => {
    return cart.put(item);
  });

  readonly save = this.effect(value$ => {
    return value$.pipe(
      switchMap(() => this.state.pipe(
        take(1),
        switchMap(cart => this.service.save(cart)),
        tap(cart => this.next(cart)),
      )),
    );
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
@Component()
class HouseCollectionComponent {
  constructor(
    readonly store: HouseCollectionStore,
  ) {
  }
}
```

## Effects

**Effects** is a mechanism that lets you produce new actions as reaction to some other ones.

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
@Injectable({
  providedIn: 'root',
})
class TestService {
  get(id: number): Observable<number> {
    return of(id + 1);
  }
}
```

Design custom effects provider by extending `EffectsProvider`.

In its nutshell, effects provider is just a collection of action streams.

In most cases you will use `Actions` provider as a source of actions.

```ts
import { Actions, EffectsProvider, dispatch } from '@ngry/store';
import { ofType } from '@ngry/rx';

@Injectable()
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

## License

MIT
