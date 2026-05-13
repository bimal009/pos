import { BaseType } from "./base";

export type CategoryType = BaseType & {
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
};
