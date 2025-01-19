import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { Member } from './member';
import { MemberService } from './member.service';

type MemberState = {
    members: Map<string, Member[]>; // string is workspaceId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialMemberState: MemberState = {
    members: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const MemberStore = signalStore(
    { providedIn: "root" },
    withState(initialMemberState),
    withMethods((store, memberService = inject(MemberService), workspaceStore = inject(WorkspaceStore)) => ({
        getMembersByWorkspaceId(workspaceId: string) : Observable<Member[]> {
            patchState(store, { loading: true });
            if (store.members().has(workspaceId)) {
                patchState(store, { loading: false });
                return of(store.members().get(workspaceId)!);
            }
            return memberService.getMembersByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (members) => {
                        const updatedMembers = new Map(store.members());
                        updatedMembers.set(workspaceId, members);
                        patchState(store, {
                            members: updatedMembers,
                            loading: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, {
                            loading: false,
                            error: error.message
                        });
                    }
                })
            );
        },
        createMember(
            workspaceId: string, 
            name: string,
            description?: string,
        ) {
            patchState(store, { creating: true });
            return memberService.createMember(workspaceId, name, description).pipe(
                tap({
                    next: (newmember) => {
                        patchState(store, {
                            members: store.members().set(workspaceId, store.members().has(workspaceId) 
                                ? [newmember, ...store.members().get(workspaceId)!]
                                : [newmember]),
                            creating: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, { creating: false, error: error.message });
                    }
                })
            )
        },
        updateMember(
            workspaceId: string,
            id: string, 
            roles: string[]
        ) {
            patchState(store, { updating: true })
            return memberService.updateMember(workspaceId, id, roles).pipe(
                tap({
                    next: (updatedmember) => {
                        patchState(store, {
                            members: store.members().set(workspaceId, store.members().has(workspaceId) 
                                ? store.members().get(workspaceId)!.map(member => member.id === updatedmember.id ? updatedmember : member)
                                : [updatedmember]),
                            updating: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, { updating: false, error: error.message });
                    }
                })
            );
        }
    })
))