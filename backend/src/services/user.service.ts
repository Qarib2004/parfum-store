import { AppError, upload } from "../middleware";
import { deleteImage, uploadImage } from "../utils/cloudinary.util";
import { hashPassword, verifyPassword } from "../utils/hash.util";



interface UpdateUserData{
    username?:string;
    email?:string;
    avatar?:string;
}



interface ChangePasswordData{
    currentPassword:string;
    newPassword:string;
}



export const getUserPortfolio = async (userId:string) => {
    const user = await prisma?.user.findUnique({
        where:{id:userId},
        select:{
            id: true,
            email: true,
            username: true,
            role: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
            shop: {
              select: {
                id: true,
                name: true,
                description: true,
                address: true,
                logoUrl: true,
              },
            },
            _count: {
              select: {
                products: true,
                orders: true,
                sentMessages: true,
                receivedMessages: true,
              },
            },
        }
    });

    if(!user){
        throw new AppError('User not found',404)
    }

    return user
}



export const getUserById = async (userId: string) => {
    const user = await prisma?.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
            logoUrl: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            brand: true,
            price: true,
            imageUrl: true,
          },
          take: 6,
        },
      },
    });
  
    if (!user) {
      throw new AppError('User not found', 404);
    }
  
    return user;
  };



  export const updateUserProfile = async (userId: string, data: UpdateUserData) => {
    const { username, email } = data;
  
    if (username || email) {
      const existingUser = await prisma?.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                username ? { username } : {},
                email ? { email } : {},
              ].filter((obj) => Object.keys(obj).length > 0),
            },
          ],
        },
      });
  
      if (existingUser) {
        if (existingUser.username === username) {
          throw new AppError('name existed', 409);
        }
        if (existingUser.email === email) {
          throw new AppError('Email already existed', 409);
        }
      }
    }
  
    const updatedUser = await prisma?.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });
  
    return updatedUser;
  };






export const updateUserAvatar = async (userId:string,fileBuffer:Buffer,originalName:string) => {

    const user = await prisma?.user.findUnique({
        where:{id:userId},
        select:{avatar:true}
    })


    if(!user){
        throw new AppError('User not foound',404)
    }

    if(user.avatar){
        await deleteImage(user.avatar)
    }

    const avatarUrl = await uploadImage(
        fileBuffer,originalName,'perfume-shop/avatars'
    )


    const updatedUser = await prisma?.user.update({
        where:{id:userId},
        data:{avatar:avatarUrl},
        select:{
            id:true,
            email:true,
            username:true,
            role:true,
            avatar:true
        }
    })

    return updatedUser

}


export  const deleteUserAvatar = async (userId: string) => {
    const user = await prisma?.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
  
    if (!user) {
      throw new AppError('User not found', 404);
    }
  
    if (user.avatar) {
      await deleteImage(user.avatar);
    }
  
    const updatedUser = await prisma?.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
      },
    });
  
    return updatedUser;
}




export const changePassword = async (userId:string,data:ChangePasswordData) => {
    const {currentPassword,newPassword} = data

    const user = await prisma?.user.findUnique({
        where:{id:userId}
    })

    if(!user){
        throw new AppError('User not found',404)
    }


    const isValidPassword = await verifyPassword(user.password,currentPassword)

    if(!isValidPassword){
        throw new AppError('Current passworn incorrect',400)
    }


    const hashedPassword = await hashPassword(newPassword)

    await prisma?.user.update({
        where:{id:userId},
        data:{password:hashedPassword}
    })


    return {message:'Password access chnaged'}

}



export const getAllUsers = async (page:number = 1,limit:number=20) => {
    const skip = (page - 1)*limit

    const [users,total] = await Promise.all([
        prisma?.user.findMany({
            skip,
            take:limit,
            select:{
                id:true,
                email:true,
                username:true,
                role:true,
                avatar:true,
                createdAt:true,
                _count:{
                    select:{
                        prodcuts:true,
                        orders:true
                    }
                }
            },
            orderBy:{createdAt:'desc'}
        }),
        prisma?.user.count()
    ])

    return{
        users,
        pagination:{
            page,limit,total:total ?? 0,totalPages:Math.ceil(total ?? 0/limit)
        }
    }

}



export const deleteUser = async (userId: string) => {
    const user = await prisma?.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
  
    if (!user) {
      throw new AppError('User not found', 404);
    }
  
    if (user.avatar) {
      await deleteImage(user.avatar);
    }
  
    await prisma?.user.delete({
      where: { id: userId },
    });
  
    return { message: 'User deleted' };
  };