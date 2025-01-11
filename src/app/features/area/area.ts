import { Room } from "../room/room";

export interface Area {
    id: string,
    name: string,
    description?: string,
    rooms: Room[]
}