import { Observable } from 'rxjs';
import { delay, map, switchMap, take, tap, toArray } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StoreBase } from './store-base';

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

@Injectable({
  providedIn: 'root',
})
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

describe('StoreBase', () => {
  let store: CheckboxStore;

  beforeEach(async () => {
    store = TestBed.inject(CheckboxStore);
  });

  describe('constructor', () => {
    it('should be a base abstract class', () => {
      expect(store).toBeInstanceOf(StoreBase);
      expect(store).toBeInstanceOf(CheckboxStore);
      expect(store.closed).toBe(false);
    });
  });

  describe('select', () => {
    it('should produce selector', (done) => {
      store.checked$.pipe(
        take(1),
      ).subscribe(checked => {
        expect(checked).toBe(false);

        done();
      });
    });
  });

  describe('updater', () => {
    it('should produce updater', (done) => {
      store.disabled$.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots[0]).toBe(false);
        expect(snapshots[1]).toBe(true);

        done();
      });

      store.setDisabled(true);
      store.setDisabled(true);
      store.complete();
    });
  });

  describe('effect', () => {
    it('should produce effect', (done) => {
      store.checked$.pipe(
        take(2),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots[0]).toBe(false);
        expect(snapshots[1]).toBe(true);

        done();
      });

      store.setChecked(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete state stream', () => {
      store.ngOnDestroy();

      expect(store.closed).toBe(true);
    });
  });
});
