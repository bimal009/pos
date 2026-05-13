import { CategoryType } from "./category";

export type CreateStore = {
  name: string;
  description?: string;
  phone: string;
  address: string;
  logo?: string;
  categoriesId: string[];
  taxType?: "none" | "pan" | "vat";
  taxNumber?: string;
};

export type CreateStoreResponse = {
  id: string;
};

export type StoreCategory = {
  storeId: string;
  categoryId: string;
  category: CategoryType;
};

export type Store = {
  id: string;
  name: string;
  description: string | null;
  phone: string;
  address: string;
  logo: string | null;

  isActive: boolean;
  ownerId: string;

  taxType: "none" | string;
  taxNumber: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  categories: StoreCategory[];
  branches: Branch[];
};

export type Branch = {
  id: string;
  storeId: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
