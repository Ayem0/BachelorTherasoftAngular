import { Slot } from "../slot/slot";

export interface Room {
    id: string,
    name: string,
    description?: string,
    slots: Slot[],
    events: Event[],
}