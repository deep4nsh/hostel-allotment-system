import { Gender } from '@prisma/client';
export declare class CreateRoomDto {
    number: string;
    capacity: number;
    yearAllowed: number[];
}
export declare class CreateFloorDto {
    number: number;
    gender: Gender;
    rooms: CreateRoomDto[];
}
export declare class CreateHostelDto {
    name: string;
    floors?: CreateFloorDto[];
}
