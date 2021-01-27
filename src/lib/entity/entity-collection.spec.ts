import { EntityCollection } from './entity-collection';

interface House {
  id: number;
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

describe('EntityCollection', () => {
  let collection: HouseCollection;

  beforeEach(() => {
    collection = new HouseCollection([
      {id: 1},
      {id: 2},
      {id: 1},
    ]);
  });

  describe('constructor', () => {
    it('should be abstract', () => {
      expect(collection).toBeInstanceOf(EntityCollection);
    });

    it('should remove duplicates by ID', () => {
      const house1: House = {id: 1};
      const house2: House = {id: 2};
      const house3: House = {id: 3};
      const house4: House = {id: 2};

      const houses = new HouseCollection([
        house1, house2, house3, house4,
      ]);

      expect(houses.entities).toEqual([
        {id: 1},
        {id: 3},
        {id: 2},
      ]);
      expect(houses.empty).toBe(false);
      expect(houses.length).toBe(3);
      expect(houses.get(1)).toEqual(house1);
      expect(houses.get(2)).toEqual(house4);
      expect(houses.get(3)).toEqual(house3);
      expect(houses.ids).toEqual([1, 3, 2]);
    });
  });

  describe('has', () => {
    it('should return true when collection has an entity with given ID', () => {
      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(true);
    });

    it('should return false when collection has not an entity with given ID', () => {
      expect(collection.has(3)).toBe(false);
      expect(collection.has(4)).toBe(false);
    });
  });

  describe('add', () => {
    it('should not modify original collection', () => {
      const house = {id: 3};
      const result = collection.add(house);

      expect(collection.length).toBe(2);
      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(true);
      expect(collection.has(3)).toBe(false);

      expect(result).not.toBe(collection);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
    });

    it('should produce new collection when entity with such ID is absent', () => {
      const result = collection.add({id: 3});

      expect(result.empty).toBe(false);
      expect(result.length).toBe(3);
      expect(result.get(1)).toEqual({id: 1});
      expect(result.get(2)).toEqual({id: 2});
      expect(result.get(3)).toEqual({id: 3});
      expect(result.ids).toEqual([2, 1, 3]);
      expect(result.entities).toEqual([
        {id: 2},
        {id: 1},
        {id: 3},
      ]);
    });

    it('should return itself when contains entity with such ID', () => {
      const house: House = {id: 1};
      const result = collection.add(house);

      expect(result).toBe(collection);
      expect(result.get(1)).not.toBe(house);
      expect(result.get(1)).toBe(collection.get(1));
    });
  });

  describe('addMany', () => {
    it('should not modify original collection', () => {
      const result = collection.addMany([
        {id: 3},
        {id: 4},
      ]);

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
      expect(result.empty).toBe(false);
      expect(result.length).toBe(4);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.has(4)).toBe(true);
    });

    it('should produce a new collection with given entities when some of them are unique', () => {
      const result = collection.addMany([
        {id: 3},
        {id: 4},
      ]);

      expect(result.empty).toBe(false);
      expect(result.length).toBe(4);
      expect(result.get(1)).toEqual({id: 1});
      expect(result.get(2)).toEqual({id: 2});
      expect(result.get(3)).toEqual({id: 3});
      expect(result.get(4)).toEqual({id: 4});
      expect(result.ids).toEqual([2, 1, 3, 4]);
      expect(result.entities).toEqual([
        {id: 2},
        {id: 1},
        {id: 3},
        {id: 4},
      ]);
    });

    it('should return itself when given list is empty', () => {
      const result = collection.addMany([]);

      expect(result).toBe(collection);
    });

    it('should return itself when already contains entities with such IDs', () => {
      const house1: House = {id: 1};
      const house2: House = {id: 2};
      const result = collection.addMany([house1, house2]);

      expect(result).toBe(collection);
      expect(result.get(1)).not.toBe(house1);
      expect(result.get(2)).not.toBe(house2);
      expect(result.get(1)).toBe(collection.get(1));
      expect(result.get(2)).toBe(collection.get(2));
    });
  });

  describe('delete', () => {
    it('should not modify original collection', () => {
      const result = collection.delete(1);

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce a new one without entity when ID match', () => {
      const result = collection.delete(1);

      expect(result.empty).toBe(false);
      expect(result.length).toBe(1);
      expect(result.get(1)).toBe(undefined);
      expect(result.get(2)).toEqual({id: 2});
      expect(result.ids).toEqual([2]);
      expect(result.entities).toEqual([
        {id: 2},
      ]);
    });

    it(`should return itself when it doesn't contain an entity with such ID`, () => {
      const result = collection.delete(3);

      expect(result).toBe(collection);
      expect(result.length).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);

      expect(collection.length).toBe(2);
      expect(collection.has(1)).toBe(true);
      expect(collection.has(1)).toBe(true);

      expect(collection.get(1)).toBe(result.get(1));
      expect(collection.get(2)).toBe(result.get(2));
    });
  });

  describe('deleteMany', () => {
    it('should not modify original collection', () => {
      const result = collection.deleteMany([1, 2]);

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce a new collection without entities with given IDs when IDs match', () => {
      const result = collection.deleteMany([1, 3]);

      expect(result).not.toBe(collection);
      expect(result.empty).toBe(false);
      expect(result.length).toBe(1);
      expect(result.get(1)).toBe(undefined);
      expect(result.get(2)).toEqual({id: 2});
      expect(result.ids).toEqual([2]);
      expect(result.entities).toEqual([
        {id: 2},
      ]);
    });

    it(`should return itself when it doesn't contain entities with such IDs`, () => {
      const result = collection.deleteMany([3, 4]);

      expect(result).toBe(collection);
      expect(result.get(1)).toBe(collection.get(1));
      expect(result.get(2)).toBe(collection.get(2));
    });
  });

  describe('remove', () => {
    it('should not modify original collection', () => {
      const result = collection.remove({id: 1});

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);
      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(true);

      expect(result).not.toBe(collection);
      expect(result.empty).toBe(false);
      expect(result.length).toBe(1);
      expect(result.has(1)).toBe(false);
      expect(result.has(2)).toBe(true);
    });

    it('should produce a new collection without entity when ID match', () => {
      const result = collection.remove({id: 1});

      expect(result).not.toBe(collection);

      expect(result.empty).toBe(false);
      expect(result.length).toBe(1);
      expect(result.get(1)).toBe(undefined);
      expect(result.get(2)).toEqual({id: 2});
      expect(result.ids).toEqual([2]);
      expect(result.entities).toEqual([
        {id: 2},
      ]);
    });
  });

  describe('removeMany', () => {
    it('should not modify original collection', () => {
      const result = collection.removeMany([
        {id: 1},
        {id: 2},
      ]);

      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce a new collection without entities when IDs match', () => {
      const result = collection.removeMany([
        {id: 1},
        {id: 2},
      ]);

      expect(result).not.toBe(collection);

      expect(result.length).toBe(0);
      expect(result.get(1)).toBe(undefined);
      expect(result.get(2)).toBe(undefined);
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual([]);
    });
  });

  describe('update', () => {
    it('should not modify original collection', () => {
      const result = collection.update({id: 1});

      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should replace entity with same ID', () => {
      const house1: House = {id: 1};
      const result = collection.update(house1);

      expect(result.length).toBe(2);
      expect(result.get(1)).toBe(house1);
      expect(collection.get(1)).not.toBe(house1);
    });

    it(`should return itself when it doesn't contain entities with the same ID`, () => {
      const result = collection.update({id: 3});

      expect(result).toBe(collection);

      expect(result.length).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(false);

      expect(collection.length).toBe(2);
      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(true);
      expect(collection.has(3)).toBe(false);
    });
  });

  describe('updateMany', () => {
    it('should not modify original collection', () => {
      const house1: House = {id: 1};
      const house2: House = {id: 2};

      const result = collection.updateMany([
        house1, house2,
      ]);

      expect(result).not.toBe(collection);
    });

    it('should replace entity with same ID', () => {
      const house1: House = {id: 1};
      const house2: House = {id: 2};

      const result = collection.updateMany([
        house1, house2,
      ]);

      expect(result.length).toBe(2);
      expect(result.get(1)).toBe(house1);
      expect(result.get(2)).toBe(house2);

      expect(collection.length).toBe(2);
      expect(collection.get(1)).not.toBe(house1);
      expect(collection.get(2)).not.toBe(house2);
    });

    it(`should return itself when it doesn't contain entities with same ID`, () => {
      const house3: House = {id: 3};
      const house4: House = {id: 4};
      const result = collection.updateMany([
        house3, house4,
      ]);

      expect(result).toBe(collection);

      expect(result.length).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(false);

      expect(collection.length).toBe(2);
      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(true);
      expect(collection.has(3)).toBe(false);
    });
  });

  describe('set', () => {
    it('should not modify original collection', () => {
      const house: House = {id: 1};
      const result = collection.set(house);

      expect(result).not.toBe(collection);

      expect(result.get(1)).toBe(house);

      expect(collection.get(1)).not.toBe(house);
    });

    it('should replace an entity when it has the same ID', () => {
      const house1: House = {id: 1};
      const result = collection.set(house1);

      expect(result).not.toBe(collection);

      expect(result.length).toBe(2);
      expect(result.get(1)).toBe(house1);

      expect(collection.get(1)).not.toBe(house1);
    });

    it(`should add missing entity when it has not the same ID`, () => {
      const result = collection.set({id: 3});

      expect(result).not.toBe(collection);

      expect(result.length).toBe(3);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);

      expect(collection.length).toBe(2);
      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(true);
      expect(collection.has(3)).toBe(false);
    });
  });

  describe('setMany', () => {
    it('should not modify original collection', () => {
      const house1: House = {id: 1};
      const house2: House = {id: 2};

      const result = collection.setMany([
        house1, house2,
      ]);

      expect(result).not.toBe(collection);
    });

    it('should replace entities when IDs match', () => {
      const house1: House = {id: 1};
      const house2: House = {id: 2};

      const result = collection.setMany([
        house1, house2,
      ]);

      expect(result.length).toBe(2);
      expect(result.get(1)).toBe(house1);
      expect(result.get(2)).toBe(house2);

      expect(collection.length).toBe(2);
      expect(collection.get(1)).not.toBe(house1);
      expect(collection.get(2)).not.toBe(house2);
    });

    it(`should add new entities when IDs don't match`, () => {
      const house3: House = {id: 3};
      const house4: House = {id: 4};
      const result = collection.setMany([
        house3, house4,
      ]);

      expect(result).not.toBe(collection);

      expect(result.length).toBe(4);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.has(4)).toBe(true);

      expect(collection.length).toBe(2);
      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(true);
      expect(collection.has(3)).toBe(false);
      expect(collection.has(4)).toBe(false);
    });
  });

  describe('includes', () => {
    it('should determine whether collection has an entity with the same ID', () => {
      expect(collection.includes({id: 1})).toBe(true);
      expect(collection.includes({id: 2})).toBe(true);
      expect(collection.includes({id: 3})).toBe(false);
    });
  });

  describe('clear', () => {
    it('should not modify original collection', () => {
      const result = collection.clear();

      expect(result).not.toBe(collection);
      expect(result).toBeInstanceOf(HouseCollection);
    });

    it('should produce an empty collection', () => {
      const result = collection.clear();

      expect(result.length).toBe(0);
    });

    it('should return itself when collection is already empty', () => {
      const result1 = collection.clear();

      expect(result1).not.toBe(collection);
      expect(result1.length).toBe(0);

      const result2 = result1.clear();

      expect(result2).not.toBe(collection);
      expect(result2).toBe(result1);
      expect(result2.length).toBe(0);
    });
  });

  describe('filter', () => {
    it('should produce a new collection with entities matching predicate', () => {
      const result = collection.filter(item => item.id > 1);

      expect(result).not.toBe(collection);
      expect(result.length).toBe(1);
      expect(result.get(1)).toEqual(undefined);
      expect(result.get(2)).toEqual({id: 2});
    });

    it('should return itself when predicate function matched all entities', () => {
      const result = collection.filter(() => true);

      expect(result).toBe(collection);
      expect(result.length).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
    });
  });

  describe('sort', () => {
    it('should not modify original collection', () => {
      const result = collection.sort((a, b) => a.id - b.id);

      expect(result).not.toBe(collection);
      expect(result).toBeInstanceOf(HouseCollection);
      expect(result.ids).toEqual([1, 2]);
      expect(result.entities).toEqual([
        {id: 1},
        {id: 2},
      ]);
    });

    it('should return original collection if sorting doesn\'t actually change the order', () => {
      const result = collection.sort((a, b) => b.id - a.id);

      expect(result).toBe(collection);
      expect(result).toBeInstanceOf(HouseCollection);
      expect(result.ids).toEqual([2, 1]);
      expect(result.entities).toEqual([
        {id: 2},
        {id: 1},
      ]);
    });

  });

  describe('toArray', () => {
    it('should return an array of entities', () => {
      expect(collection.toArray()).toEqual([
        {id: 2},
        {id: 1},
      ]);
    });
  });
});
