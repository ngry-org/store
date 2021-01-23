import { EMPTY, Observable, of } from 'rxjs';
import { delay, finalize, switchMap, take, tap, toArray } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TaskState } from '@ngry/rx';
import { LocalStore } from './local-store';

interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
}

interface Cart {
  id?: number;
  items: ReadonlyArray<CartItem>;
}

@Injectable({
  providedIn: 'root',
})
class CartService {
  find(
    cartId: number,
  ): Observable<TaskState<Cart>> {
    return of(
      TaskState.complete({
        id: cartId,
        items: [
          {
            productId: 1,
            quantity: 1,
          },
        ],
      }),
    ).pipe(
      delay(10),
    );
  }

  save(
    cart: Cart,
  ): Observable<TaskState<Cart>> {
    return of(
      TaskState.complete({
        id: 1,
        items: cart.items.map((item, index) => {
          return {
            ...item,
            id: index + 1,
          };
        }),
      }),
    ).pipe(
      delay(10),
    );
  }

  putItem(
    cartId: number,
    item: CartItem,
  ): Observable<TaskState<Cart>> {
    return of(
      TaskState.complete({
        id: cartId,
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 1,
          },
          {
            ...item,
            id: 2,
          },
        ],
      }),
    ).pipe(
      delay(10),
    );
  }
}

@Injectable({
  providedIn: 'root',
})
class CartStore extends LocalStore<TaskState<Cart>> {
  readonly cart = this.select(state => state.result);
  readonly cartId = this.select(state => state.result?.id);
  readonly cartItems = this.select(state => state.result?.items);
  readonly loading = this.select(state => state.pending);

  private pendingItems: Array<CartItem> = [];

  constructor(
    private service: CartService,
  ) {
    super(TaskState.initial());
  }

  readonly load = this.effect((id$: Observable<number | undefined>) => {
    return id$.pipe(
      switchMap(id => id ? this.service.find(id) : of(TaskState.complete<Cart>())),
      tap(state => this.next(state)),
    );
  });

  readonly save = this.effect((update$: Observable<Cart>) => {
    return update$.pipe(
      switchMap(update => {
        return this.cart.pipe(
          take(1),
          switchMap(cart => {
            if (cart) {
              return this.service.save({
                ...cart,
                ...update,
              });
            } else {
              return this.service.save({
                ...update,
                items: [...update.items, ...this.pendingItems],
              }).pipe(
                finalize(() => {
                  this.pendingItems = [];
                }),
              );
            }
          }),
        );
      }),
      tap(state => this.next(state)),
    );
  });

  readonly addItem = this.effect((item$: Observable<CartItem>) => {
    return item$.pipe(
      switchMap(item => {
        return this.cartId.pipe(
          take(1),
          switchMap(cartId => {
            if (cartId) {
              return this.service.putItem(cartId, item);
            } else {
              this.addPendingItem(item);
              return EMPTY;
            }
          }),
        );
      }),
      tap(state => this.next(state)),
    );
  });

  private addPendingItem = this.updater((state, item: CartItem) => {
    this.pendingItems.push(item);

    return state;
  });
}

describe('LocalStore', () => {
  let store: CartStore;

  beforeEach(async () => {
    store = TestBed.inject(CartStore);
  });

  describe('constructor', () => {
    it('should be a base abstract class', () => {
      expect(store).toBeInstanceOf(LocalStore);
      expect(store).toBeInstanceOf(CartStore);
    });
  });

  describe('select', () => {
    it('should produce selector', (done) => {
      store.cartId.pipe(
        take(2),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots[0]).toBe(undefined);
        expect(snapshots[1]).toBe(1);

        done();
      });

      store.load(1);
    });
  });

  describe('updater', () => {
    it('should produce updater', (done) => {
      store.cartItems.pipe(
        take(1),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots[0]).toBe(undefined);

        done();
      });

      store.addItem({
        id: 2,
        productId: 2,
        quantity: 1,
      });
    });
  });

  describe('effect', () => {
    it('should produce effect', (done) => {
      store.cart.pipe(
        take(2),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots).toEqual([
          undefined,
          {
            id: 1,
            items: [
              {
                id: 1,
                quantity: 3,
                productId: 3,
              },
            ],
          },
        ]);

        done();
      });

      store.addItem({
        quantity: 3,
        productId: 3,
      });

      store.save({
        items: [],
      });
    });
  });
});
