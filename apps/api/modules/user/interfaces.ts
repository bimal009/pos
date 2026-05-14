export interface CreateUserDto {
  name: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  userType?: "individual" | "company";
  platformRole?: "superadmin";
  isOnboarded?: boolean;
  planId?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
  image?: string;
  emailVerified?: boolean;
  phoneNumberVerified?: boolean;
  userType?: "individual" | "company";
  platformRole?: "user";
  isOnboarded?: boolean;
  planId?: string;
}

export interface OnboardUserDto {
  name: string;
  email?: string;
  image?: string;
}
