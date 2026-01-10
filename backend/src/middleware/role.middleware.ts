import type { NextFunction, Request, Response } from "express";
import { success } from "zod";



type Role = 'USER' | 'OWNER' | 'ADMIN';


export class RoleMiddleware{

    static requireRole(...allowedRoles:Role[]){
        return(req:Request,res:Response,next:NextFunction) => {
                if(!req.user){
                    return res.status(401).json({
                        success:false,
                        message:'Required authentification'
                    })
                }


                if (!allowedRoles.includes(req.user.role as Role)) {
                    return res.status(403).json({
                      success: false,
                      message: 'no role access',
                    });
                  }
            
                  next();
                };

    }


    static requireOwner(req:Request,res:Response,next:NextFunction){
        return RoleMiddleware.requireRole('OWNER','ADMIN')(req,res,next)
    }

   

    
    static requireAdmin(req:Request,res:Response,next:NextFunction){
        return RoleMiddleware.requireRole('ADMIN')(req,res,next)
    }



    static requireOwnership(resourceUserIdField:string = 'userId'){
        return async(req:Request,res:Response,next:NextFunction) => {
            if(!req.user){
                return res.status(401).json({
                    success:false,
                    message:'Nedded authentification'
                })
            }

            if(req.user.role === 'ADMIN'){
                return next()
            }


            const resourceOwnerId = req.params[resourceUserIdField] || 
            req.body[resourceUserIdField] ||
            (req as any)[resourceUserIdField]


            if(!resourceOwnerId){
                return res.status(400).json({
                    success:false,
                    message:'id user not found'
                })
            }


            if(req.user.userId !== resourceOwnerId){
                return res.status(403).json({
                    success:false,
                    message:'You dont have access in this resource'
                })
            }

            next()
        }
    }


}

export const requireRole = RoleMiddleware.requireRole;
export const requireOwner = RoleMiddleware.requireOwner;
export const requireAdmin = RoleMiddleware.requireAdmin;
export const requireOwnership = RoleMiddleware.requireOwnership;