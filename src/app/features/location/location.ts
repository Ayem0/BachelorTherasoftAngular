import { Area } from "../area/area";

export interface Place {
    id: string,
    name: string,
    description?: string,
    address?: string,
    city?: string,
    country?: string,
    areas: Area[]
}