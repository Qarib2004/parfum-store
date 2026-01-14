import type { Socket,Server } from "socket.io"
import { prisma } from '../../config/database';



export interface AuthenticatedUser {
    userId: string;       
    username: string;     
    email: string;       
    role: 'USER' | 'OWNER' | 'ADMIN'; 
    avatar?: string;      
    shopId?: string;      
  }


export interface AuthenticatedSocket extends Socket{
    user:AuthenticatedUser
}


interface MarkNotificationReadPayload{
     notificationId:string
}




export const notificationHandler = (io:Server,socket:AuthenticatedSocket) => {
    const userId = socket.user.userId

    socket.on('get_notifictaions',async (payload?:{page?:number;limit?:number}) => {
        try {
            const {page = 1,limit = 20} = payload || {};
            const skip = (page-1)*limit;

            const [notifications,unreadCount] = await Promise.all([
                prisma.notification.findMany({
                    where:{userId},
                    orderBy:{createdAt:'desc'},
                    skip,
                    take:limit
                }),
                prisma.notification.count({
                    where:{userId,read:false}
                })
            ])

            socket.emit('notifications_list', {
                notifications,
                unreadCount,
                page,
                hasMore: notifications.length === limit,
              });


        } catch (error) {
            console.error('Get notifications error:', error);
      socket.emit('error', { message: 'error for getting message' });
        }
    });


    socket.on('get_unread_count', async () => {
        try {
          const unreadCount = await prisma.notification.count({
            where: { userId, read: false },
          });
    
          socket.emit('unread_count', { count: unreadCount });
        } catch (error) {
          console.error('Get unread count error:', error);
        }
      });


      socket.on('mark_notification_read', async (payload: MarkNotificationReadPayload) => {
        try {
          const { notificationId } = payload;
    
          await prisma.notification.update({
            where: {
              id: notificationId,
              userId, 
            },
            data: { read: true },
          });
    
          socket.emit('notification_read', { notificationId });
    
          const unreadCount = await prisma.notification.count({
            where: { userId, read: false },
          });
    
          socket.emit('unread_count', { count: unreadCount });
        } catch (error) {
          console.error('Mark notification read error:', error);
        }
      });




      socket.on('mark_all_read', async () => {
        try {
          await prisma.notification.updateMany({
            where: {
              userId,
              read: false,
            },
            data: { read: true },
          });
    
          socket.emit('all_notifications_read');
          socket.emit('unread_count', { count: 0 });
        } catch (error) {
          console.error('Mark all read error:', error);
        }
      });




      socket.on('delete_notification', async (payload: { notificationId: string }) => {
        try {
          const { notificationId } = payload;
    
          await prisma.notification.delete({
            where: {
              id: notificationId,
              userId,
            },
          });
    
          socket.emit('notification_deleted', { notificationId });
    
          const unreadCount = await prisma.notification.count({
            where: { userId, read: false },
          });
    
          socket.emit('unread_count', { count: unreadCount });
        } catch (error) {
          console.error('Delete notification error:', error);
        }
      });



      socket.on('delete_all_read', async () => {
        try {
          await prisma.notification.deleteMany({
            where: {
              userId,
              read: true,
            },
          });
    
          socket.emit('read_notifications_deleted');
        } catch (error) {
          console.error('Delete all read error:', error);
        }
      });



}