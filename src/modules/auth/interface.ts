import { UserRole } from "../../../generated/prisma/enums";

export interface ILoginUser {
    email: string;
    password: string;
}

export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    profilePhoto?: string;
}

export interface IUpdateProfilePayload {
    name?: string;
    phone?: string;
    bio?: string;
    profilePhoto?: string;
}