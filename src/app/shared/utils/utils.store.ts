import { Entity } from '../models/entity';

export function updateModelMap<T extends Entity>(
  map: Map<string, T>,
  models: T[]
) {
  models.forEach((model) => {
    map.set(model.id, model);
  });
  return map;
}

export function updateParentMap<T extends Entity>(
  map: Map<string, string[]>,
  id: string,
  models: T[]
) {
  map.set(
    id,
    models.map((x) => x.id)
  );
  return map;
}

export function addModelToParentMap<T extends Entity>(
  map: Map<string, string[]>,
  id: string,
  model: T
) {
  if (map.has(id)) {
    map.set(id, [...map.get(id)!, model.id]);
  }
  return map;
}
