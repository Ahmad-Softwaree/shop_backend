export type CRUDReturn = { message: string; data?: any };

export type MessageResponse = { message: string };

export type Status = 400 | 401 | 402 | 403 | 404 | 500;
export type DataTypes = any;

export type PaginationObject<T extends DataTypes | Partial<DataTypes>> = {
  data: T[];
  next: boolean;
  total: number;
  total_page: number;
  page: number;
  limit: number;
};

export type PaginationType<T extends DataTypes | Partial<DataTypes>> =
  PaginationObject<T>;

export type RegularTypeArray<T extends DataTypes | Partial<DataTypes>> = {
  data: T[] | Partial<T>[];
};
export type RegularType<T extends DataTypes | Partial<DataTypes>> = {
  data: T | Partial<T>;
};
export type HasImage<T extends boolean = true> = T extends true
  ? {
      image: string;
    }
  : Partial<{
      image: string;
    }>;
export type PaginationParams = { page: number; limit: number };
export type QueryParam = {
  filter?: string;
  user?: string;
  search?: string;
  to?: string;
  from?: string;
  status?: string;
};

export type Language = {
  name: string;
  dir: 'rtl' | 'ltr';
  preview: string;
  default: boolean;
};
