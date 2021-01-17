import { take, toArray } from 'rxjs/operators';
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

  describe('add', () => {
    it('should emit new collection with added entity', (done) => {
      store.state.pipe(
        take(2),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
          ]),
        ]);

        done();
      });

      store.add(new House(1));
    });
  });

  describe('addMany', () => {
    it('should emit new collection with added entities', (done) => {
      store.state.pipe(
        take(2),
        toArray(),
      ).subscribe(snapshots => {
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
    });
  });

  describe('insert', () => {
    it('should emit new collection with added entity', (done) => {
      store.state.pipe(
        take(2),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
          ]),
        ]);

        done();
      });

      store.insert(0, new House(1));
    });
  });

  describe('insertMany', () => {
    it('should emit new collection with added entities', (done) => {
      store.state.pipe(
        take(2),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots).toEqual([
          new HouseCollection(),
          new HouseCollection([
            new House(1),
            new House(2),
          ]),
        ]);

        done();
      });

      store.insertMany(0, [
        new House(1),
        new House(2),
      ]);
    });
  });

  describe('delete', () => {
    it('should emit new collection without deleted entity', (done) => {
      store.state.pipe(
        take(3),
        toArray(),
      ).subscribe(snapshots => {
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
    });
  });

  describe('deleteMany', () => {
    it('should emit new collection without deleted entities', (done) => {
      store.state.pipe(
        take(3),
        toArray(),
      ).subscribe(snapshots => {
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
    });
  });

  describe('remove', () => {
    it('should emit new collection without deleted entity', (done) => {
      store.state.pipe(
        take(3),
        toArray(),
      ).subscribe(snapshots => {
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
    });
  });

  describe('removeMany', () => {
    it('should emit new collection without deleted entities', (done) => {
      store.state.pipe(
        take(3),
        toArray(),
      ).subscribe(snapshots => {
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
    });
  });

  describe('clear', () => {
    it('should emit new collection with no entities', (done) => {
      store.state.pipe(
        take(3),
        toArray(),
      ).subscribe(snapshots => {
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
    });
  });

  describe('update', () => {
    it('should emit new collection with replaced entity', (done) => {
      store.state.pipe(
        take(3),
        toArray(),
      ).subscribe(snapshots => {
        expect(snapshots.length).toBe(3);

        expect(snapshots[0].length).toBe(0);

        expect(snapshots[1].length).toBe(2);
        expect(snapshots[1].get(1)).toBe(house1);
        expect(snapshots[1].get(2)).toBe(house2);

        expect(snapshots[2].length).toBe(2);
        expect(snapshots[2].get(1)).toBe(house1);
        expect(snapshots[2].get(2)).toBe(update);

        done();
      });

      const house1 = new House(1);
      const house2 = new House(2);
      const update = new House(2);

      store.addMany([house1, house2]);

      store.update(update);
    });
  });

  describe('filter', () => {
    it('should emit new collection with replaced entity', (done) => {
      store.state.pipe(
        take(3),
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

      store.filter(house => house.id > 1);
    });
  });
});
