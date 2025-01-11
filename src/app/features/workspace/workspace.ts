import { User } from "../../core/auth/models/auth"
import { EventCategory } from "../event-category/event-category"
import { Place } from "../location/location"
import { ParticipantCategory } from "../participant-category/participant-category"
import { Participant } from "../participant/participant"
import { Slot } from "../slot/slot"
import { Tag } from "../tag/tag"

export interface Workspace {
    id: string,
    name: string,
    description?: string,
    participants: Participant[],
    participantCategories: ParticipantCategory[],
    locations: Place[],
    eventCategories: EventCategory[],
    tags: Tag[],
    users: User[],
    workspaceRoles: WorkspaceRole[],
    slots: Slot[]
}

export interface WorkspaceRole {
    id: string,
    name: string,
    description?: string,
}










