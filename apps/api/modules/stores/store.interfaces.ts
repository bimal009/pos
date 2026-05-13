export interface CreateStoreBody {
  name: string;
  description?: string;
  phone: string;
  address: string;
  logo?: string;
  categoriesId: string[];
  taxType?: "none" | "pan" | "vat";
  taxNumber?: string;
}

export type UpdateStoreBody = Partial<CreateStoreBody>;
