import { toArray } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { On } from './decorator/on.decorator';
import { StateStore } from './state-store';

export class Check {
}

export class Uncheck {
}

export class CheckboxState {

  constructor(
    readonly checked = false,
  ) {
  }

  @On(Check)
  check(): CheckboxState {
    if (this.checked) {
      return this;
    }

    return new CheckboxState(true);
  }

  @On(Uncheck)
  uncheck(): CheckboxState {
    if (!this.checked) {
      return this;
    }

    return new CheckboxState(false);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CartStore extends StateStore<CheckboxState, Check | Uncheck> {
  constructor() {
    super(new CheckboxState());
  }
}

describe('StateStore', () => {
  let store: CartStore;

  beforeEach(() => {
    store = new CartStore();
  });

  describe('dispatch', () => {
    it('should produce state changes on actions', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(states => {
        expect(states.length).toEqual(3);
        expect(states).toEqual([
          new CheckboxState(false),
          new CheckboxState(true),
          new CheckboxState(false),
        ]);

        done();
      });

      store.dispatch(new Check());
      store.dispatch(new Check());
      store.dispatch(new Uncheck());
      store.complete();
    });
  });
});
