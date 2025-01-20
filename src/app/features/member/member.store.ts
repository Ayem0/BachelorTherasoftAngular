import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { Member } from './member';
import { MemberService } from './member.service';

type MemberState = {
    members: Map<string, Member>; // string is id,
    memberIdsByWorkspaceId: Map<string, string[]>,
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialMemberState: MemberState = {
    members: new Map(),
    memberIdsByWorkspaceId: new Map(),
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
            if (store.memberIdsByWorkspaceId().has(workspaceId)) {
                const ids = store.memberIdsByWorkspaceId().get(workspaceId)!;
                patchState(store, { loading: false });
                return of(ids.map(x => store.members().get(x)!));
            }
            return memberService.getMembersByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (members) => {
                        const updatedMemberIdsByWorkspaceId = new Map(store.memberIdsByWorkspaceId());
                        updatedMemberIdsByWorkspaceId.set(workspaceId, members.map(wr => wr.id));
                        const updatedMembers = new Map(store.members());
                        members.forEach(x => updatedMembers.set(x.id, x));
                        patchState(store, {
                            members: updatedMembers,
                            memberIdsByWorkspaceId: updatedMemberIdsByWorkspaceId,
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
                    next: (newMember) => {
                        const updatedMembers = new Map(store.members());
                        updatedMembers.set(newMember.id, newMember);
                        let updatedMemberIdsByWorkspaceId : Map<string, string[]> | null = null;
                        if (store.memberIdsByWorkspaceId().has(workspaceId)) {
                            updatedMemberIdsByWorkspaceId = new Map(store.memberIdsByWorkspaceId());
                            updatedMemberIdsByWorkspaceId.set(workspaceId, [...store.memberIdsByWorkspaceId().get(workspaceId)!, newMember.id]);
                        } 

                        patchState(store, {
                            members: updatedMembers,
                            memberIdsByWorkspaceId: updatedMemberIdsByWorkspaceId ?? store.memberIdsByWorkspaceId(),
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
            id: string, 
            roles: string[]
        ) {
            patchState(store, { updating: true })
            return memberService.updateMember(id, roles).pipe(
                tap({
                    next: (updatedMember) => {
                        const updatedMembers = new Map(store.members());
                        updatedMembers.set(updatedMember.id, updatedMember);
                        patchState(store, {
                            members: updatedMembers,
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