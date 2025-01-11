import { ParticipantCategory } from "../participant-category/participant-category";

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
