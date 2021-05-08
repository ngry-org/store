import { combineLatest } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router,  } from '@angular/router';
import { RouterTestingModule,  } from '@angular/router/testing';
import { RouterStoreBase } from './router-store-base';

interface TestState {
  readonly page: number;
  readonly limit: number;
}

@Injectable()
class TestRouterStore extends RouterStoreBase<TestState> {
  readonly page$ = this.select(state => state.page);
  readonly limit$ = this.select(state => state.limit);

  constructor(injector: Injector) {
    super(injector, {
      page: 1,
      limit: 20,
    }, 'state');
  }

  setPage = this.updater((state, page: number) => ({...state, page}));

  setLimit = this.updater((state, limit: number) => ({...state, limit}));
}

describe('RouterStoreBase', () => {
  let route: ActivatedRoute;
  let router: Router;
  let store: TestRouterStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [
        TestRouterStore,
      ],
    });

    route = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    store = TestBed.inject(TestRouterStore);
  });

  describe('constructor', () => {
    it('should be a base abstract class', () => {
      expect(store).toBeInstanceOf(RouterStoreBase);
      expect(store).toBeInstanceOf(TestRouterStore);
    });
  });

  describe('state', () => {
    it('should have an initial state', (done) => {
      store.state.pipe(
        take(1),
      ).subscribe(state => {
        expect(route.snapshot.queryParamMap.has('state')).toBe(false);

        expect(state).toEqual({
          page: 1,
          limit: 20,
        });

        done();
      });
    });

    it('should emit new state when query params have been changed via router', async (done) => {
      store.state.pipe(
        take(2),
        toArray(),
      ).subscribe(states => {
        expect(route.snapshot.queryParamMap.has('state')).toBe(true);

        expect(states[0]).toEqual({
          page: 1,
          limit: 20,
        });

        expect(states[1]).toEqual({
          page: 2,
          limit: 20,
        });

        done();
      });

      await router.navigate([], {
        queryParams: {
          state: JSON.stringify({
            page: 2,
            limit: 20,
          }),
        },
      });
    });
  });

  describe('select', () => {
    it('should produce selector', (done) => {
      combineLatest([
        store.page$,
        store.limit$,
      ]).pipe(
        take(1),
      ).subscribe(([page, limit]) => {
        expect(page).toBe(1);
        expect(limit).toBe(20);

        done();
      });
    });
  });

  describe('updater', () => {
    it('should produce updater', async (done) => {
      store.state.pipe(
        take(3),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots[0]).toEqual({
          page: 1,
          limit: 20,
        });

        expect(snapshots[1]).toEqual({
          page: 2,
          limit: 20,
        });

        expect(snapshots[2]).toEqual({
          page: 2,
          limit: 50,
        });

        done();
      });

      store.setPage(2);
      store.setLimit(50);
    });
  });
});
