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
      expect(collection.entities).toEqual([
        {id: 2},
        {id: 1},
      ]);
      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);
      expect(collection.get(1)).toEqual({id: 1});
      expect(collection.get(2)).toEqual({id: 2});
      expect(collection.ids).toEqual([2, 1]);
    });
  });

  describe('add', () => {
    it('should not modify original collection', () => {
      const result = collection.add({id: 3});

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce new collection with entity', () => {
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
    });

    it('should produce a new collection with entities', () => {
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

    it('should return original collection if entities list is empty', () => {
      const result = collection.addMany([]);

      expect(result).toBe(collection);
    });
  });

  describe('insert', () => {
    it('should not modify original collection', () => {
      const result = collection.insert(1, {id: 3});

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce new collection with entity', () => {
      const result1 = collection.insert(1, {id: 3});

      expect(result1.empty).toBe(false);
      expect(result1.length).toBe(3);
      expect(result1.get(1)).toEqual({id: 1});
      expect(result1.get(2)).toEqual({id: 2});
      expect(result1.get(3)).toEqual({id: 3});
      expect(result1.ids).toEqual([2, 3, 1]);
      expect(result1.entities).toEqual([
        {id: 2},
        {id: 3},
        {id: 1},
      ]);

      const result2 = collection.insert(0, {id: 3});

      expect(result2.empty).toBe(false);
      expect(result2.length).toBe(3);
      expect(result2.get(1)).toEqual({id: 1});
      expect(result2.get(2)).toEqual({id: 2});
      expect(result2.get(3)).toEqual({id: 3});
      expect(result2.ids).toEqual([3, 2, 1]);
      expect(result2.entities).toEqual([
        {id: 3},
        {id: 2},
        {id: 1},
      ]);
    });
  });

  describe('insertMany', () => {
    it('should not modify original collection', () => {
      const result = collection.insertMany(1, [
        {id: 3},
        {id: 4},
      ]);

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce a new one with entities', () => {
      const result1 = collection.insertMany(1, [
        {id: 3},
        {id: 4},
      ]);

      expect(result1.empty).toBe(false);
      expect(result1.length).toBe(4);
      expect(result1.get(1)).toEqual({id: 1});
      expect(result1.get(2)).toEqual({id: 2});
      expect(result1.get(3)).toEqual({id: 3});
      expect(result1.get(4)).toEqual({id: 4});
      expect(result1.ids).toEqual([2, 3, 4, 1]);
      expect(result1.entities).toEqual([
        {id: 2},
        {id: 3},
        {id: 4},
        {id: 1},
      ]);

      const result2 = collection.insertMany(0, [
        {id: 3},
        {id: 4},
      ]);

      expect(result2.empty).toBe(false);
      expect(result2.length).toBe(4);
      expect(result2.get(1)).toEqual({id: 1});
      expect(result2.get(2)).toEqual({id: 2});
      expect(result2.get(3)).toEqual({id: 3});
      expect(result2.get(4)).toEqual({id: 4});
      expect(result2.ids).toEqual([3, 4, 2, 1]);
      expect(result2.entities).toEqual([
        {id: 3},
        {id: 4},
        {id: 2},
        {id: 1},
      ]);
    });

    it('should return original collection if entities list is empty', () => {
      const result = collection.insertMany(0, []);

      expect(result).toBe(collection);
    });
  });

  describe('delete', () => {
    it('should not modify original collection', () => {
      const result = collection.delete(1);

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce a new one without entity', () => {
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

    it('should return original collection if it doesn\'t contain an entity with such ID', () => {
      const result = collection.delete(3);

      expect(result).toBe(collection);
    });
  });

  describe('deleteMany', () => {
    it('should not modify original collection', () => {
      const result = collection.deleteMany([1, 2]);

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce a new one without entities', () => {
      const result = collection.deleteMany([1, 3]);

      expect(result.empty).toBe(false);
      expect(result.length).toBe(1);
      expect(result.get(1)).toBe(undefined);
      expect(result.get(2)).toEqual({id: 2});
      expect(result.ids).toEqual([2]);
      expect(result.entities).toEqual([
        {id: 2},
      ]);
    });

    it('should return original collection if it doesn\'t contain entities with such IDs', () => {
      const result = collection.deleteMany([3, 4]);

      expect(result).toBe(collection);
    });
  });

  describe('remove', () => {
    it('should not modify original collection', () => {
      const result = collection.remove({id: 1});

      expect(collection.empty).toBe(false);
      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should produce a new one without entity', () => {
      const result = collection.remove({id: 1});

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

    it('should produce a new one without entities', () => {
      const result = collection.removeMany([
        {id: 1},
        {id: 2},
      ]);

      expect(result.length).toBe(0);
      expect(result.get(1)).toBe(undefined);
      expect(result.get(2)).toBe(undefined);
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual([]);
    });
  });

  describe('has', () => {
    it('should determine whether collection has an entity with given ID', () => {
      expect(collection.has(1)).toBe(true);
      expect(collection.has(2)).toBe(true);
      expect(collection.has(3)).toBe(false);
    });
  });

  describe('update', () => {
    it('should not modify original collection', () => {
      const result = collection.update({id: 1});

      expect(collection.length).toBe(2);

      expect(result).not.toBe(collection);
    });

    it('should replace entity with same ID', () => {
      const update = {id: 1};
      const result = collection.update(update);

      expect(result.length).toBe(2);
      expect(result.get(1)).toBe(update);
      expect(collection.get(1)).not.toBe(update);
    });

    it('should return original collection if it doesn\'t contain entities with same ID', () => {
      const result = collection.update({id: 3});

      expect(result).toBe(collection);
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
  });

  describe('filter', () => {
    it('should produce a new collection with entities matching predicate', () => {
      const result = collection.filter(item => item.id > 1);

      expect(result).not.toBe(collection);
      expect(result.length).toBe(1);
      expect(result.get(1)).toEqual(undefined);
      expect(result.get(2)).toEqual({id: 2});
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
