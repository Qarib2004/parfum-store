import { Socket } from "socket.io";

export interface SocketUser {
  userId: string;
  username: string;
  email: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  avatar?: string;
  shopId?: string;
}

export type AuthSocket = Socket & {
  user: SocketUser;
};
