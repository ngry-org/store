import { On } from '../state/decorator/on.decorator';
import { Injectable } from '@angular/core';
import { FeatureStore } from './feature-store';
import { take, toArray } from 'rxjs/operators';

export class Load {
}

export class Loaded {
  constructor(
    readonly items: Array<CartItem>,
  ) {
  }
}

export class Failed {
  constructor(
    readonly error: Error,
  ) {
  }
}

export class Put {
  constructor(
    readonly item: CartItem,
  ) {
  }
}

export class CartItem {
  constructor(
    readonly productId: number,
    readonly quantity: number,
  ) {
  }
}

export class CartState {

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

@Injectable({
  providedIn: 'root',
})
export class CartStore extends FeatureStore<CartState, Load | Loaded | Failed | Put> {

  constructor() {
    super(new CartState());
  }
}

describe('FeatureStore', () => {
  let store: CartStore;

  beforeEach(() => {
    store = new CartStore();
  });

  describe('dispatch', () => {
    it('should produce state changes on actions', (done) => {
      store.state.pipe(
        take(4),
        toArray(),
      ).subscribe(states => {
        expect(states.length).toEqual(4);
        expect(states).toEqual([
          new CartState(),
          new CartState(true),
          new CartState(false, [
            new CartItem(1, 1),
          ]),
          new CartState(false, [
            new CartItem(1, 1),
            new CartItem(2, 1),
          ]),
        ]);

        done();
      });

      store.dispatch(new Load());
      store.dispatch(new Loaded([
        new CartItem(1, 1),
      ]));
      store.dispatch(new Put(
        new CartItem(2, 1),
      ));
    });
  });
});
