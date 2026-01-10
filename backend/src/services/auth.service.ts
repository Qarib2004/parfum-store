import { AppError } from "../middleware";
import type { RegisterInput } from "../schemas/auth.schema";
import { hashPassword, verifyPassword } from '../utils/hash.util';
import { generateAccessToken, generateRefreshToken, saveRefreshToken } from "../utils/jwt.util";




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