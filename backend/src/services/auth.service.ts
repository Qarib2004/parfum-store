import { AppError } from "../middleware";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import { hashPassword, verifyPassword } from '../utils/hash.util';
import { findRefreshToken, generateAccessToken, generateRefreshToken, removeRefreahToken, saveRefreshToken, verifyRefreshToken } from "../utils/jwt.util";




export const register = async (data:RegisterInput) => {
    const {email,username,password} = data

    const existingUser = await prisma?.user.findFirst({
        where:{
            OR:[{email},{username}]
        }
    })

    if(existingUser){
        if(existingUser.email === email){
            throw new AppError('Email existed',409)
        }

        throw new AppError('username existing',409)
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma?.user.create({
        data:{
            email,username,password:hashedPassword
        },
        select:{
            id:true,
            email:true,
            username:true,
            role:true,
            avatar:true,
            createdAt:true
        }
    });

    const accessToken = generateAccessToken({
        userId:user!.id,
        email:user!.email,
        role:user!.role
    })

    const refreshToken = generateRefreshToken({
        userId:user!.id,
        email:user!.email,
        role:user!.role
    })


    await saveRefreshToken(user!.id,refreshToken);


    return{
        user,accessToken,refreshToken
    }

}




export const login = async(data:LoginInput) => {
    const {email,password}= data

    const user = await prisma?.user.findUnique({
        where:{email}
    })

    if(!user){
        throw new AppError('User is not existed')
    }


    const isValidPassword = await verifyPassword(user.password,password)

    if(!isValidPassword){
        throw new AppError('not valid password')
    }



    const accessToken = generateAccessToken({
        userId:user!.id,
        email:user!.email,
        role:user!.role
    })

    const refreshToken = generateRefreshToken({
        userId:user!.id,
        email:user!.email,
        role:user!.role
    })


    await saveRefreshToken(user.id,refreshToken)


    return {
        user:{
            id:user.id,
            email:user.email,
            username:user.username,
            role:user.role,
            avatar:user.avatar,
            createdAt:user.createdAt
        },
        accessToken,
        refreshToken
    }

}




export const refreshAccessToken = async (refreshToken:string) => {
    const payload = verifyRefreshToken(refreshToken)

    const tokenRecord = await findRefreshToken(refreshToken)

    if(!tokenRecord){
        throw new AppError('Token not found',401)
    }

    const user = await prisma?.user.findUnique({
        where:{id:payload.userId},
        select:{
            id:true,
            email:true,
            username:true,
            role:true,
            avatar:true
        }
    })

    if(!user){
        throw new AppError('user not  found',404)
    }


    const accessToken = generateAccessToken({
        userId:user!.id,
        email:user!.email,
        role:user!.role
    })

    return{
        user,accessToken
    }
}



export const logout = async (refreshToken:string) => {
    await removeRefreahToken(refreshToken)
    return {
        message:'Exit by success'
    }
}



export const getCurrentUser = async (userId: string) => {
    const user = await prisma?.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });
  
    if (!user) {
      throw new AppError('User not found', 404);
    }
  
    return user;
  };