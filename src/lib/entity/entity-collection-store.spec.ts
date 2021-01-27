import { toArray } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EntityCollection } from './entity-collection';
import { EntityCollectionStore } from './entity-collection-store';

class House {
  constructor(
    readonly id: number,
  ) {
  }
}

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

@Injectable()
class HouseCollectionStore extends EntityCollectionStore<number, House, HouseCollection> {
  constructor() {
    super(new HouseCollection());
  }
}

describe('EntityCollectionStore', () => {
  let store: HouseCollectionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HouseCollectionStore,
      ],
    });

    store = TestBed.inject(HouseCollectionStore);
  });

  describe('ids', () => {
    it('should emit arrays of ids', done => {
      store.ids.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots[0].length).toBe(0);

        expect(snapshots[1].length).toBe(1);
        expect(snapshots[1]).toEqual([1]);

        expect(snapshots[2].length).toBe(2);
        expect(snapshots[2]).toEqual([1, 2]);

        done();
      });

      store.add(new House(1));
      store.add(new House(2));

      store.complete();
    });
  });

  describe('entities', () => {
    it('should emit arrays of entities', done => {
      store.entities.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots[0].length).toBe(0);

        expect(snapshots[1].length).toBe(1);
        expect(snapshots[1]).toEqual([house1]);

        expect(snapshots[2].length).toBe(2);
        expect(snapshots[2]).toEqual([house1, house2]);

        done();
      });

      const house1 = new House(1);
      const house2 = new House(2);

      store.add(house1);
      store.add(house2);

      store.complete();
    });
  });

  describe('length', () => {
    it('should emit arrays of entities', done => {
      store.length.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots[0]).toBe(0);
        expect(snapshots[1]).toBe(1);
        expect(snapshots[2]).toBe(2);

        done();
      });

      const house1 = new House(1);
      const house2 = new House(2);

      store.add(house1);
      store.add(house2);

      store.complete();
    });
  });

  describe('empty', () => {
    it('should emit arrays of entities', done => {
      store.empty.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(2);

        expect(snapshots[0]).toBe(true);
        expect(snapshots[1]).toBe(false);

        done();
      });

      const house1 = new House(1);
      const house2 = new House(2);

      store.add(house1);
      store.add(house2);

      store.complete();
    });
  });

  describe('add', () => {
    it('should emit new collection with added entity', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(2);

        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
          ]),
        ]);

        done();
      });

      store.add(new House(1));
      store.add(new House(1));

      store.complete();
    });
  });

  describe('addMany', () => {
    it('should emit new collection with added entities', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(2);

        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
            new House(2),
          ]),
        ]);

        done();
      });

      store.addMany([
        new House(1),
        new House(2),
      ]);

      store.addMany([
        new House(1),
        new House(2),
      ]);

      store.complete();
    });
  });

  describe('set', () => {
    it('should emit new collection with replaced entity', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(4);

        expect(snapshots[0].length).toBe(0);

        expect(snapshots[1].length).toBe(1);
        expect(snapshots[1].has(1)).toBe(true);
        expect(snapshots[1].has(2)).toBe(false);

        expect(snapshots[2].length).toBe(1);
        expect(snapshots[2].has(1)).toBe(true);
        expect(snapshots[2].has(2)).toBe(false);

        expect(snapshots[3].length).toBe(2);
        expect(snapshots[3].has(1)).toBe(true);
        expect(snapshots[3].has(2)).toBe(true);

        done();
      });

      store.set(new House(1));
      store.set(new House(1));
      store.set(new House(2));

      store.complete();
    });
  });

  describe('setMany', () => {
    it('should emit new collection with replaced entities', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots[0].length).toBe(0);
        expect(snapshots[0].has(1)).toBe(false);
        expect(snapshots[0].has(2)).toBe(false);

        expect(snapshots[1].length).toBe(2);
        expect(snapshots[1].has(1)).toBe(true);
        expect(snapshots[1].has(2)).toBe(true);

        expect(snapshots[2].length).toBe(2);
        expect(snapshots[2].has(1)).toBe(true);
        expect(snapshots[2].has(2)).toBe(true);

        done();
      });

      store.setMany([
        new House(1),
        new House(2),
      ]);

      store.setMany([
        new House(1),
        new House(2),
      ]);

      store.complete();
    });
  });

  describe('delete', () => {
    it('should emit new collection without deleted entity', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
          ]),
          new HouseCollection(),
        ]);

        done();
      });

      store.add(new House(1));

      store.delete(1);
      store.delete(1);

      store.complete();
    });
  });

  describe('deleteMany', () => {
    it('should emit new collection without deleted entities', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
            new House(2),
          ]),
          new HouseCollection(),
        ]);

        done();
      });

      store.addMany([
        new House(1),
        new House(2),
      ]);

      store.deleteMany([1, 2]);
      store.deleteMany([1, 2]);

      store.complete();
    });
  });

  describe('remove', () => {
    it('should emit new collection without deleted entity', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
          ]),
          new HouseCollection(),
        ]);

        done();
      });

      store.add(new House(1));

      store.remove(new House(1));
      store.remove(new House(1));

      store.complete();
    });
  });

  describe('removeMany', () => {
    it('should emit new collection without deleted entities', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
            new House(2),
          ]),
          new HouseCollection(),
        ]);

        done();
      });

      store.addMany([
        new House(1),
        new House(2),
      ]);

      store.removeMany([
        new House(1),
        new House(2),
      ]);

      store.removeMany([
        new House(1),
        new House(2),
      ]);

      store.complete();
    });
  });

  describe('clear', () => {
    it('should emit new collection with no entities', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
            new House(2),
          ]),
          new HouseCollection(),
        ]);

        done();
      });

      store.addMany([
        new House(1),
        new House(2),
      ]);

      store.clear();
      store.clear();

      store.complete();
    });
  });

  describe('update', () => {
    it('should emit new collection with replaced entity', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(4);

        expect(snapshots[0].length).toBe(0);

        expect(snapshots[1].length).toBe(2);
        expect(snapshots[1].get(1)).toBe(house1);
        expect(snapshots[1].get(2)).toBe(house2);

        expect(snapshots[2].length).toBe(2);
        expect(snapshots[2].get(1)).toBe(house1);
        expect(snapshots[2].get(2)).toBe(update2);

        expect(snapshots[3].length).toBe(2);
        expect(snapshots[3].get(1)).toBe(house1);
        expect(snapshots[3].get(2)).toBe(update2);
        expect(snapshots[3].get(3)).toBe(undefined);

        done();
      });

      const house1 = new House(1);
      const house2 = new House(2);
      const update2 = new House(2);
      const update3 = new House(3);

      store.addMany([house1, house2]);

      store.update(update2);
      store.update(update2);
      store.update(update3);

      store.complete();
    });
  });

  describe('updateMany', () => {
    it('should emit new collection with replaced entity', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots[0].length).toBe(0);

        expect(snapshots[1].length).toBe(2);
        expect(snapshots[1].get(1)).toBe(house1);
        expect(snapshots[1].get(2)).toBe(house2);
        expect(snapshots[1].get(3)).toBe(undefined);

        expect(snapshots[2].length).toBe(2);
        expect(snapshots[2].get(1)).toBe(house1);
        expect(snapshots[2].get(2)).toBe(update2);
        expect(snapshots[2].get(3)).toBe(undefined);

        done();
      });

      const house1 = new House(1);
      const house2 = new House(2);
      const update2 = new House(2);
      const update3 = new House(3);

      store.addMany([house1, house2]);

      store.updateMany([update2, update3]);

      store.complete();
    });
  });

  describe('filter', () => {
    it('should emit new collection with entities matching predicate', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots[0].length).toBe(0);

        expect(snapshots[1].length).toBe(2);
        expect(snapshots[1].get(1)).toBe(house1);
        expect(snapshots[1].get(2)).toBe(house2);

        expect(snapshots[2].length).toBe(1);
        expect(snapshots[2].get(1)).toBe(undefined);
        expect(snapshots[2].get(2)).toBe(house2);

        done();
      });

      const house1 = new House(1);
      const house2 = new House(2);

      store.addMany([house1, house2]);

      store.filter(house => house != null);
      store.filter(house => house.id > 1);
      store.filter(house => house.id > 1);

      store.complete();
    });
  });

  describe('sort', () => {
    it('should emit new collection with sorted entities', (done) => {
      store.state.pipe(
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(4);

        expect(snapshots[0].length).toBe(0);

        expect(snapshots[1].length).toBe(3);
        expect(snapshots[1].ids).toEqual([1, 3, 2]);
        expect(snapshots[1].entities).toEqual([house1, house3, house2]);

        expect(snapshots[2].length).toBe(3);
        expect(snapshots[2].ids).toEqual([1, 2, 3]);
        expect(snapshots[2].entities).toEqual([house1, house2, house3]);

        expect(snapshots[3].length).toBe(3);
        expect(snapshots[3].ids).toEqual([3, 2, 1]);
        expect(snapshots[3].entities).toEqual([house3, house2, house1]);

        done();
      });

      const house1 = new House(1);
      const house2 = new House(2);
      const house3 = new House(3);

      store.addMany([house1, house3, house2]);

      store.sort((a, b) => a.id - b.id);
      store.sort((a, b) => b.id - a.id);

      store.complete();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete the stream', done => {
      store.state.subscribe({
        complete: done,
      });

      store.ngOnDestroy();
    });
  });
});
