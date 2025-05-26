import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { User } from '../../../core/auth/models/auth';
import { Area } from '../../../features/area/models/area';
import { EventCategory } from '../../../features/event-category/models/event-category';
import { Event, EventKey } from '../../../features/event/models/event';
import { Invitation } from '../../../features/invitation/models/invitation.model';
import { Location } from '../../../features/location/models/location';
import { ParticipantCategory } from '../../../features/participant-category/models/participant-category';
import { Participant } from '../../../features/participant/models/participant';
import { Room } from '../../../features/room/models/room';
import { Slot } from '../../../features/slot/models/slot';
import { Tag } from '../../../features/tag/models/tag';
import { WorkspaceRole } from '../../../features/workspace-role/models/workspace-role';
import { Workspace } from '../../../features/workspace/models/workspace';
import { Entity, Id } from '../../models/entity';

export type StoreState = {
  // Area
  areas: Map<Id, Area>;
  areasRooms: Map<Id, Set<Id>>;

  // Workspace
  workspaces: Map<Id, Workspace>;
  workspacesLocations: Map<Id, Set<Id>>;
  workspacesUsers: Map<Id, Set<Id>>;
  workspacesTags: Map<Id, Set<Id>>;
  workspacesParticipants: Map<Id, Set<Id>>;
  workspacesParticipantCategories: Map<Id, Set<Id>>;
  workspacesEventCategories: Map<Id, Set<Id>>;
  workspacesWorkspaceRoles: Map<Id, Set<Id>>;
  workspacesSlots: Map<Id, Set<Id>>;
  workspacesAreas: Map<Id, Set<Id>>;
  workspacesRooms: Map<Id, Set<Id>>;
  workspacesInvitations: Map<Id, Set<Id>>;

  // Event
  events: Map<Id, Event>;
  eventsParticipants: Map<Id, Set<Id>>;
  eventsUsers: Map<Id, Set<Id>>;
  eventsTags: Map<Id, Set<Id>>;

  // Location
  locations: Map<Id, Location>;
  locationsAreas: Map<Id, Set<Id>>;

  // EventCategory
  eventCategories: Map<Id, EventCategory>;

  // Participant
  participants: Map<Id, Participant>;

  // ParticipantCategory
  participantCategories: Map<Id, ParticipantCategory>;

  // WorkspaceRole
  workspaceRoles: Map<Id, WorkspaceRole>;

  // Tag
  tags: Map<Id, Tag>;

  // Invitation
  invitations: Map<Id, Invitation>;

  // User
  users: Map<Id, User>;
  usersEvents: Map<EventKey, Set<Id>>;
  usersContacts: Map<Id, Set<Id>>;
  usersBlockedUsers: Map<Id, Set<Id>>;
  usersWorkspaces: Map<Id, Set<Id>>;
  usersSentInvitations: Map<Id, Set<Id>>;
  usersReceivedInvitations: Map<Id, Set<Id>>;

  // Slot
  slots: Map<Id, Slot>;
  slotsEventCategories: Map<Id, Set<Id>>;
  slotsRooms: Map<Id, Set<Id>>;

  // Room
  rooms: Map<Id, Room>;
  roomsSlots: Map<Id, Set<Id>>;
  roomsEvents: Map<EventKey, Set<Id>>;
};

type MapEntity<T> = T extends Map<unknown, infer V extends Entity> ? V : never;

type SetValue<T> = T extends Set<infer V> ? V : never;

type MapKey<T> = T extends Map<infer K, unknown> ? K : never;

type MapValue<T> = T extends Map<unknown, infer V> ? V : never;

type MapSet<T> = T extends Map<unknown, infer V extends Set<unknown>>
  ? V
  : never;

const initialStoreState: StoreState = {
  areas: new Map(),
  areasRooms: new Map(),

  workspaces: new Map(),
  workspacesLocations: new Map(),
  workspacesUsers: new Map(),
  workspacesTags: new Map(),
  workspacesParticipants: new Map(),
  workspacesParticipantCategories: new Map(),
  workspacesEventCategories: new Map(),
  workspacesWorkspaceRoles: new Map(),
  workspacesSlots: new Map(),
  workspacesAreas: new Map(),
  workspacesRooms: new Map(),
  workspacesInvitations: new Map(),

  events: new Map(),
  eventsParticipants: new Map(),
  eventsUsers: new Map(),
  eventsTags: new Map(),

  locations: new Map(),
  locationsAreas: new Map(),

  eventCategories: new Map(),

  participants: new Map(),

  participantCategories: new Map(),

  workspaceRoles: new Map(),

  tags: new Map(),

  invitations: new Map(),

  users: new Map(),
  usersEvents: new Map(),
  usersBlockedUsers: new Map(),
  usersContacts: new Map(),
  usersReceivedInvitations: new Map(),
  usersSentInvitations: new Map(),
  usersWorkspaces: new Map(),

  slots: new Map(),
  slotsEventCategories: new Map(),
  slotsRooms: new Map(),

  rooms: new Map(),
  roomsSlots: new Map(),
  roomsEvents: new Map(),
};

export const Store = signalStore(
  { providedIn: 'root' },
  withState(initialStoreState),
  withMethods((store) => ({
    /** Set an entity in the store
     * @param key The key of the store to set the entity in
     * @param entity The entity to set in the store
     */
    setEntity<K extends keyof StoreState>(
      key: K,
      entity: MapEntity<StoreState[K]>
    ) {
      patchState(store, {
        [key]: new Map([
          ...(store[key]() as Map<
            MapKey<StoreState[K]>,
            MapEntity<StoreState[K]>
          >),
          [entity.id as MapKey<StoreState[K]>, entity],
        ]),
      });
    },
    /** Set entities in the store
     * @param key The key of the store to set the entities in
     * @param entities The entities to set in the store
     */
    setEntities<K extends keyof StoreState>(
      key: K,
      entities: MapEntity<StoreState[K]>[]
    ) {
      patchState(store, {
        [key]: new Map([
          ...(store[key]() as Map<
            MapKey<StoreState[K]>,
            MapEntity<StoreState[K]>
          >),
          ...entities.map((e) => [e.id as MapKey<StoreState[K]>, e] as const),
        ]),
      });
    },
    /** Delete entity in the store
     * @param key The key of the store of the entity to delete
     * @param id The id of the entity to delete
     */
    deleteEntity<K extends keyof StoreState>(
      key: K,
      id: MapKey<StoreState[K]>
    ) {
      const newEntities = new Map(
        store[key]() as Map<MapKey<StoreState[K]>, MapEntity<StoreState[K]>>
      );
      newEntities.delete(id);
      patchState(store, {
        [key]: newEntities,
      });
    },
    /** Delete entities in the store
     * @param key The key of the store of the entities to delete
     * @param ids The ids of the entities to delete
     */
    deleteEntities<K extends keyof StoreState>(
      key: K,
      ids: MapKey<StoreState[K]>[]
    ) {
      const newEntities = new Map(
        store[key]() as Map<MapKey<StoreState[K]>, MapEntity<StoreState[K]>>
      );
      ids.forEach((id) => {
        newEntities.delete(id);
      });
      patchState(store, {
        [key]: newEntities,
      });
    },
    /** Clear store state */
    clear() {
      patchState(store, initialStoreState);
    },
    /**
     * Set a relation in the store
     * @param storeKey Key of the store
     * @param key Id of the entity
     * @param value Set of ids
     */
    setRelation<K extends keyof StoreState>(
      storeKey: K,
      key: MapKey<StoreState[K]>,
      value: SetValue<MapValue<StoreState[K]>>[]
    ) {
      patchState(store, {
        [storeKey]: new Map([
          ...(store[storeKey]() as Map<
            MapKey<StoreState[K]>,
            SetValue<MapValue<StoreState[K]>>
          >),
          [key, new Set(value) as SetValue<MapValue<StoreState[K]>>],
        ]),
      });
    },
    /**
     * Add an id to a relation set in the store
     * @param storeKey Key of the store
     * @param key Id of the entity
     * @param value Id to add to the relation set
     */
    addToRelation<K extends keyof StoreState>(
      storeKey: K,
      key: MapKey<StoreState[K]>,
      value: SetValue<MapValue<StoreState[K]>>
    ) {
      const map = new Map(
        store[storeKey]() as Map<MapKey<StoreState[K]>, MapSet<StoreState[K]>>
      );
      if (map.has(key)) {
        const set = new Set(map.get(key)!) as MapSet<StoreState[K]>;
        map.set(key, set.add(value));
      }
      patchState(store, {
        [storeKey]: map,
      });
    },
    /**
     * Remove an id from a relation set in the store
     * @param storeKey Key of the store
     * @param key Id of the entity to delete relation from
     * @param keyToDelete Id to delete from the relation set
     */
    deleteFromRelation<K extends keyof StoreState>(
      storeKey: K,
      key: MapKey<StoreState[K]>,
      keyToDelete: SetValue<MapValue<StoreState[K]>>
    ) {
      const map = new Map(
        store[storeKey]() as Map<MapKey<StoreState[K]>, MapSet<StoreState[K]>>
      );
      if (map.has(key)) {
        const set = new Set(map.get(key)!) as MapSet<StoreState[K]>;
        set.delete(keyToDelete);
        map.set(key, set);
      }
      patchState(store, {
        [storeKey]: map,
      });
    },
  }))
);
