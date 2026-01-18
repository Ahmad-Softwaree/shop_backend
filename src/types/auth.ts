import { User } from 'src/generated/prisma/client';

export type JWTPayload = {
  userId: number;
};

export type LoginType = {
  user: Partial<User>;
  jwt: string;
};
