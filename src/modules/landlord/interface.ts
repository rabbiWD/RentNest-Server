import {
    PropertyStatus,
    RentalRequestStatus,
} from "../../../generated/prisma/client";

export interface ICreatePropertyPayload {
    categoryId: string;
    title: string;
    description: string;
    address: string;
    city: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    rentPrice: number;
    amenities: string[];
    images: string[];
}

export interface IUpdatePropertyPayload {
    categoryId?: string;
    title?: string;
    description?: string;
    address?: string;
    city?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    rentPrice?: number;
    amenities?: string[];
    images?: string[];
    status?: PropertyStatus;
}

export interface IUpdateRentalRequestPayload {
    status: RentalRequestStatus;
}