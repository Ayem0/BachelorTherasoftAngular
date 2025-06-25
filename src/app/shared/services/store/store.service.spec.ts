import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Workspace } from '../../../features/workspace/models/workspace';
import { Store } from './store.service';

describe('Store', () => {
  let store: InstanceType<typeof Store>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    store = TestBed.inject(Store);
  });

  afterEach(() => {
    store.clear();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should add entity to store', () => {
    const workspace: Workspace = { id: '1', name: 'test', color: 'test' };
    store.setEntity('workspaces', workspace);
    expect(store.workspaces().get(workspace.id)).toBe(workspace);
  });

  it('should add entities to store', () => {
    const workspace1: Workspace = { id: '1', name: 'test', color: 'test' };
    const workspace2: Workspace = { id: '2', name: 'test', color: 'test' };
    store.setEntities('workspaces', [workspace1, workspace2]);
    expect(store.workspaces().size).toBe(2);
    expect(store.workspaces().get(workspace1.id)).toBe(workspace1);
    expect(store.workspaces().get(workspace2.id)).toBe(workspace2);
  });

  it('should set relation to store', () => {
    const key = 'test';
    const relation = ['test2'];
    store.setRelation('workspacesUsers', key, relation);
    expect(store.workspacesUsers().get(key)).toEqual(new Set<string>(relation));
  });

  it('should add to existing relation to store', () => {
    const key = 'test';
    const rel = ['test2'];
    store.setRelation('workspacesUsers', key, rel);
    const rel2 = 'test3';
    store.addToRelation('workspacesUsers', key, rel2);

    expect(store.workspacesUsers().get(key)).toEqual(
      new Set<string>([...rel, rel2])
    );
  });

  it('should remove from existing relation to store', () => {
    const key = 'key';
    const rel1 = 'rel1';
    const rel2 = 'rel2';

    store.setRelation('workspacesUsers', key, [rel1, rel2]);
    store.deleteFromRelation('workspacesUsers', key, rel1);

    expect(store.workspacesUsers().get(key)).toEqual(new Set<string>([rel2]));
  });

  it('should remove entity from store', () => {
    const workspace1: Workspace = { id: '1', name: 'test', color: 'test' };
    const workspace2: Workspace = { id: '2', name: 'test', color: 'test' };
    store.setEntities('workspaces', [workspace1, workspace2]);
    store.deleteEntity('workspaces', workspace1.id);
    expect(store.workspaces().size).toBe(1);
    expect(store.workspaces().get(workspace1.id)).toBeUndefined();
    expect(store.workspaces().get(workspace2.id)).toBe(workspace2);
  });

  it('should remove entities from store', () => {
    const workspace1: Workspace = { id: '1', name: 'test', color: 'test' };
    const workspace2: Workspace = { id: '2', name: 'test', color: 'test' };
    const workspace3: Workspace = { id: '3', name: 'test', color: 'test' };
    store.setEntities('workspaces', [workspace1, workspace2, workspace3]);
    store.deleteEntities('workspaces', [workspace1.id, workspace3.id]);
    expect(store.workspaces().size).toBe(1);
    expect(store.workspaces().get(workspace1.id)).toBeUndefined();
    expect(store.workspaces().get(workspace2.id)).toBe(workspace2);
    expect(store.workspaces().get(workspace3.id)).toBeUndefined();
  });

  it('should clear store', () => {
    const workspace1: Workspace = { id: '1', name: 'test', color: 'test' };
    const workspace2: Workspace = { id: '2', name: 'test', color: 'test' };
    const workspace3: Workspace = { id: '3', name: 'test', color: 'test' };
    store.setEntities('workspaces', [workspace1, workspace2, workspace3]);
    store.clear();
    expect(store.workspaces().size).toBe(0);
  });
});
