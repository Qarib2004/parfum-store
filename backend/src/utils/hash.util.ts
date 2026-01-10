import * as argon2 from 'argon2'


export class HashUtil {
    static async hashPassword(password:string):Promise<string>{
        try {

            const hash = await argon2.hash(password,{
                type:argon2.argon2id,
                memoryCost:65536,
                timeCost:3,
                parallelism:4
            })

            return hash;
            
        } catch (error) {
            throw new Error('error during hash password')
        }
    }

    static async verifyPassword(hash:string,password:string):Promise<boolean>{
        try {
            return await argon2.verify(hash,password)
        } catch (error) {
            return false
        }
    }
}


export const hashPassword = HashUtil.hashPassword;
export const verifyPassword = HashUtil.verifyPassword;