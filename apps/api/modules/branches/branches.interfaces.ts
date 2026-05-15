export interface CreateBranchBody {
  name: string;
  phone?: string;
  address?: string;
  isMain?: boolean;
}

export type UpdateBranchBody = Partial<CreateBranchBody> & {
  isActive?: boolean;
};
