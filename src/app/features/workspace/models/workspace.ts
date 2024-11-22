import { User } from "../../../core/auth/models/auth"
import { Interval } from "../../calendar/models/calendar"

export interface Workspace {
    id: string,
    name: string,
    description?: string,
    participants: Participant[],
    participantCategories: ParticipantCategory[],
    locations: Location[],
    eventCategories: EventCategory[],
    tags: Tag[],
    users: User[],
    workspaceRoles: WorkspaceRole[],
    slots: Slot[]
}

export interface Event {
    id: string,
    description?: string,
    users: User[],
    startDate: Date,
    endDate: Date,
    room: Room,
    repetitionInterval?: Interval,
    repetitionNumber?: number,
    repetitionEndDate?: Date,
    participants: Participant[],
    eventCategory: EventCategory,
    tags: Tag[],
}


export interface Room {
    id: string,
    name: string,
    description?: string,
    slots: Slot[],
    events: Event[],
}


export interface Area {
    id: string,
    name: string,
    description?: string,
    rooms: Room[]
}

export interface Location {
    id: string,
    name: string,
    description?: string,
    address: string,
    city: string,
    country: string,
    areas: Area[]
}

export interface WorkspaceRole {
    id: string,
    name: string,
    description?: string,
}


export interface Tag {
    id: string,
    name: string,
    description?: string,
}


export interface Participant {
    id: string,
    firstName: string,
    lastName: string,
    email?: string,
    phoneNumber?: string,
    address?: string,
    city?: string,
    country?: string,
    description?: string,
    dateOfBirth?: Date,
    participantCategory: ParticipantCategory
}

export interface EventCategory {
    id: string,
    name: string,
    description?: string,
}

export interface ParticipantCategory {
    id: string,
    name: string,
    description?: string,
}

export interface Slot {
    id: string,
    name: string,
    description?: string,
    startDate: Date,
    startTime: Date,
    endDate: Date,
    endTime: Date,
    repetitionInterval?: Interval,
    repetitionNumber?: number,
    repetitionEndDate?: Date,
    eventCategories: EventCategory[]
}