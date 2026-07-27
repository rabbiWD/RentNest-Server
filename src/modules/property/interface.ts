import { PropertyStatus } from "../../../generated/prisma/enums";

export interface IPropertyQuery {
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: PropertyStatus
    type?: string;
    categoryId?: string;

    searchTerm?: string;
    page?: string;
    limit?: string;
    sortOrder?: string;
    sortBy?: string
}