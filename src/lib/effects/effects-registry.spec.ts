import { Observable, of } from 'rxjs';
import { map, switchMap, take, tap, toArray } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatch, ofType } from '@ngry/rx';
import { Actions } from '../action/actions';
import { EffectsProvider } from './effects-provider';
import { EffectsModule } from './effects.module';

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

@Injectable({
  providedIn: 'root',
})
class TestService {
  get(id: number): Observable<number> {
    return of(id + 1);
  }
}

@Injectable()
class TestEffects extends EffectsProvider {
  constructor(
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
          // Perform some side effects
          return action;
        }),
        // Break circular dispatching of Load action
        dispatch(false),
      ),
    ]);
  }
}

describe('EffectsRegistry', () => {
  describe('register', () => {
    let actions: Actions;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          EffectsModule.forFeature([
            TestEffects,
          ]),
        ],
      });

      actions = TestBed.inject(Actions);
    });

    it('should connect effects to action bus', (done) => {
      actions.pipe(
        take(2),
        toArray(),
      ).subscribe(result => {
        expect(result).toEqual([
          new Load(1),
          new Loaded(2),
        ]);

        done();
      });

      actions.next(new Load(1));
    });
  });
});
