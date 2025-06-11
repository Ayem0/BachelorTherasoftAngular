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

  it('should set entity to store', () => {
    const workspace: Workspace = { id: '1', name: 'test', color: 'test' };
    store.setEntity('workspaces', workspace);
    expect(store.workspaces().get(workspace.id)).toBe(workspace);
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
});
