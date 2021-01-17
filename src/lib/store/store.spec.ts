import { Observable } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';
import { On } from '../state/decorator/on.decorator';
import { Store } from './store';
import { StoreModule } from './store.module';

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

describe('Store', () => {
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forFeature([
          {
            useFactory(): CartState {
              return new CartState();
            },
          },
        ]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
  });

  describe('select', () => {
    it('should return a stream of specified state snapshots', () => {
      const observable = store.select(CartState);

      expect(observable).toBeInstanceOf(Observable);
    });
  });

  describe('dispatch', () => {
    it('should produce state changes on actions', (done) => {
      store.select(CartState).pipe(take(4), toArray()).subscribe(states => {
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
