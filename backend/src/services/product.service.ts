import { AppError } from "../middleware";
import type { CreateProductInput } from "../schemas/product.shcema";
import { uploadImage } from "../utils/cloudinary.util";



export const createProduct = async (ownerId:string,data:CreateProductInput) => {
    const user = await prisma?.user.findUnique({
        where:{id:ownerId},
        select:{role:true}
    })

    if(!user || (user.role !== 'OWNER' && user?.role !== 'ADMIN')){
        throw new AppError('Only owner and admin can create products',403)
    }

    const product = await prisma?.product.create({
        data:{
            ...data,
            ownerId
        },
        include:{
            owner:{
                select:{
                    id:true,
                    username:true,
                    avatar:true
                }
            }
        }
    })

    return product;


}


export const createProductWithImage = async (
    ownerId:string,
    data:CreateProductInput,
    fileBuffer:Buffer,
    originalNmae:string
) => {
    const imageUrl = await uploadImage(fileBuffer,originalNmae,'perfume-shop/products')

    const productData = {
        ...data,imageUrl
    }


    return createProduct(ownerId,productData)

}



