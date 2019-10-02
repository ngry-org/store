import { map, tap } from 'rxjs/operators';
import { RuntimeException } from '@monument/core';
import { Action, Actions, Catch, Effect, Errors, Reaction, State, Store } from '@monument/store';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StoreModule } from './store.module';
import Spy = jasmine.Spy;

const LOAD = 'LOAD';
const LOAD_SUCCESS = 'LOAD_SUCCESS';
const LOAD_FAIL = 'LOAD_FAIL';

interface Product {
  name: string;
  price: number;
}

class Load implements Action {
  readonly type = LOAD;

  constructor(readonly success: boolean) {
  }
}

class LoadSuccess implements Action {
  readonly type = LOAD_SUCCESS;

  constructor(readonly products: Product[]) {
  }
}

class LoadFail implements Action {
  readonly type = LOAD_FAIL;

  constructor(readonly error: CartException) {
  }
}

interface CartStateSnapshot {
  readonly loading: boolean;
  readonly loaded: boolean;
  readonly products: Product[];
  readonly totalPrice: number;
  readonly error?: Error;
}

class CartException extends RuntimeException {
}

class CartState implements State<CartStateSnapshot> {
  loading = false;
  loaded = false;
  products: Product[] = [];
  error?: CartException;

  get totalPrice() {
    return this.products.reduce((price, product) => price + product.price, 0);
  }

  @Reaction(LOAD)
  onLoad() {
    this.loading = true;
    this.loaded = false;
    this.error = undefined;
    this.products = [];
  }

  @Reaction(LOAD_SUCCESS)
  onLoaded(action: LoadSuccess) {
    this.loading = false;
    this.loaded = true;
    this.products = action.products;
  }

  @Reaction(LOAD_FAIL)
  onLoadFail(action: LoadFail) {
    this.loading = false;
    this.loaded = true;
    this.error = action.error;
  }

  getSnapshot(): CartStateSnapshot {
    const {loading, loaded, error, products, totalPrice} = this;

    return {
      loading,
      loaded,
      products: [...products],
      totalPrice,
      error
    };
  }
}

@Injectable()
class CartStore extends Store<CartStateSnapshot, CartState> {
  constructor(actions: Actions) {
    super(actions, new CartState());
  }
}

@Injectable()
class CartEffects {
  @Effect()
  readonly load = this.actions.ofType<Load>(LOAD).pipe(
    map((action: Load) => {
      if (action.success) {
        return new LoadSuccess([
          {
            name: 'Product1',
            price: 1
          },
          {
            name: 'Product2',
            price: 2
          }
        ]);
      } else {
        return new LoadFail(new CartException('Error occurred while loading cart'));
      }
    })
  );

  @Effect({dispatch: false})
  readonly loadFail = this.actions.ofType<LoadFail>(LOAD_FAIL).pipe(
    tap(action => {
      this.errors.next(action.error);
    })
  );

  constructor(readonly actions: Actions, readonly errors: Errors) {
  }
}

@Injectable()
class CartErrorHandlers {
  @Catch(CartException)
  add(exception: CartException) {
    console.error(exception);
  }
}

function testStoreModule(description: string, setup: () => void) {
  describe('StoreModule', () => {
    describe(description, () => {
      let actions: Actions;
      let errors: Errors;
      let cartStore: CartStore;
      let actionsSpy: Spy;
      let errorsSpy: Spy;
      let consoleError: Spy;

      beforeEach(() => {
        setup();
        actions = TestBed.get(Actions);
        errors = TestBed.get(Errors);
        cartStore = TestBed.get(CartStore);
        actionsSpy = spyOn(actions, 'next').and.callThrough();
        errorsSpy = spyOn(errors, 'next').and.callThrough();
        consoleError = spyOn(console, 'error').and.stub();
      });

      it('should provide actions stream', () => {
        expect(actions).toBeInstanceOf(Actions);
      });

      it('should provide errors stream', () => {
        expect(errors).toBeInstanceOf(Errors);
      });

      it('should provide store instance', () => {
        expect(cartStore).toBeInstanceOf(CartStore);
      });

      it('should invoke @Reaction and @Catch methods', () => {
        expect(actionsSpy).toHaveBeenCalledTimes(0);
        expect(errorsSpy).toHaveBeenCalledTimes(0);
        expect(cartStore.snapshot).toEqual({
          loading: false,
          loaded: false,
          products: [],
          totalPrice: 0
        });
        actions.next(new Load(true));
        expect(actionsSpy).toHaveBeenCalledTimes(2);
        expect(actionsSpy).toHaveBeenNthCalledWith(1, new Load(true));
        expect(actionsSpy).toHaveBeenNthCalledWith(2, new LoadSuccess([
          {
            name: 'Product1',
            price: 1
          },
          {
            name: 'Product2',
            price: 2
          }
        ]));
        expect(errorsSpy).toHaveBeenCalledTimes(0);
        expect(cartStore.snapshot).toEqual({
          loading: false,
          loaded: true,
          products: [
            {
              name: 'Product1',
              price: 1
            },
            {
              name: 'Product2',
              price: 2
            }
          ],
          totalPrice: 3
        });
        actions.next(new Load(false));
        expect(cartStore.snapshot).toEqual({
          loading: false,
          loaded: true,
          products: [],
          totalPrice: 0,
          error: new CartException('Error occurred while loading cart')
        });
        expect(consoleError).toHaveBeenNthCalledWith(1, new CartException('Error occurred while loading cart'));
        expect(errorsSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
}

testStoreModule('forRoot()', () => {
  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({
        store: CartStore,
        effects: [CartEffects],
        errorHandlers: [CartErrorHandlers]
      })
    ]
  });
});

testStoreModule('forFeature()', () => {
  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot(),
      StoreModule.forFeature({
        store: CartStore,
        effects: [CartEffects],
        errorHandlers: [CartErrorHandlers]
      })
    ]
  });
});

describe('StoreModule', () => {
  describe('forRoot() only', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot()
        ]
      });
    });

    it('should provide Actions stream', () => {
      expect(TestBed.get(Actions)).toBeInstanceOf(Actions);
    });

    it('should provide Errors stream', () => {
      expect(TestBed.get(Errors)).toBeInstanceOf(Errors);
    });
  });
});
