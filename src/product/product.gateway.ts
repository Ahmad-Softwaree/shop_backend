import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { Product } from 'src/generated/prisma/client';

@WebSocketGateway({
  namespace: 'products',
  cors: {
    origin: '*',
  },
})
export class ProductGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(private authService: AuthService) {}

  handleConnection(client: Socket) {
    try {
      console.log(client);
      console.log(`Client connected: ${client.id}`);
      this.authService.verifyToken(client.handshake.auth.token);
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
  sendProductUpdate(product: Partial<Product>) {
    this.server.emit('productUpdate', product);
  }
}
