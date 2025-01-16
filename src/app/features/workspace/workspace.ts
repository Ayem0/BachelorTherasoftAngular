import { EventCategory } from "../event-category/event-category"
import { Place } from "../location/location"
import { Member } from "../member/member"
import { ParticipantCategory } from "../participant-category/participant-category"
import { Participant } from "../participant/participant"
import { Slot } from "../slot/slot"
import { Tag } from "../tag/tag"
import { WorkspaceRole } from "../workspace-role/workspace-role"

export interface Workspace {
    id: string,
    name: string,
    description?: string,
    participants: Participant[],
    participantCategories: ParticipantCategory[],
    locations: Place[],
    eventCategories: EventCategory[],
    tags: Tag[],
    members: Member[],
    workspaceRoles: WorkspaceRole[],
    slots: Slot[]
}











