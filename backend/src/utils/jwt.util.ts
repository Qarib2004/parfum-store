import jwt from 'jsonwebtoken'
import { env } from '../config/env';
import { prisma } from '../config/database';



interface TokenPayload{
    userId:string,
    email:string,
    role:string 
}



export class JWTUtil {
    static generateAccessToken(payload:TokenPayload):string{

        if(!env.JWT_ACCESS_SECRET){
            throw new Error('jwt access secret is not defined')
        }

        if(!env.JWT_ACCESS_EXPIRY){
            throw new Error('jwt access expiry is not defined')
        }

        return jwt.sign(payload,env.JWT_ACCESS_SECRET,{
            expiresIn:env.JWT_ACCESS_EXPIRY,
        })
    }



    static generateRefreshToken(payload:TokenPayload):string {
        return jwt.sign(payload,env.JWT_REFRESH_SECRET,{
            expiresIn:env.JWT_REFRESH_EXPIRY
        })
    }

    static verifyAccessToken(token:string):TokenPayload{
        try {
            return jwt.verify(token,env.JWT_ACCESS_SECRET) as TokenPayload
        } catch (error) {
            throw new Error('access token not expired')
        }
    }


    static verifyRefreshToken(token:string):TokenPayload{
        try {
            return jwt.verify(token,env.JWT_REFRESH_SECRET) as TokenPayload
        } catch (error) {
            throw new Error('refresh error not expired')
        }
    }


    static async saveRefreshToken(userId:string,token:string):Promise<void>{
        const expiresAt = new Date()

        expiresAt.setDate(expiresAt.getDate() + 7)

        await prisma.refreshToken.create({
            data:{
                token,userId,expiresAt
            }
        })

    }

       
    static async removeRefreahToken(token:string){
        await prisma.refreshToken.deleteMany({
            where:{token}
        })
    }


    static async findRefreshToken(token:string){
        return await prisma.refreshToken.findUnique({
            where:{token},
            include:{user:true}
        })
    }

    static async cleanExpiredTokens():Promise<void>{
        await prisma.refreshToken.deleteMany({
            where:{
                expiresAt:{
                    lt:new Date()
                }
            }
        })
    }


}


export const generateAccessToken =  JWTUtil.generateAccessToken;
export const generateRefreshToken =  JWTUtil.generateRefreshToken;
export const saveRefreshToken =  JWTUtil.saveRefreshToken;
export const removeRefreahToken =  JWTUtil.removeRefreahToken;
export const findRefreshToken =  JWTUtil.findRefreshToken;
export const verifyRefreshToken =  JWTUtil.verifyRefreshToken;
export const verifyAccessToken =  JWTUtil.verifyAccessToken;