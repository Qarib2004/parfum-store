import { AppError } from "../middleware";
import type { CreateProductInput, UpdateProductInput } from "../schemas/product.shcema";
import { deleteImage, uploadImage } from "../utils/cloudinary.util";
import { generateUniqueProductSlug } from "../utils/slug.utils";



export const createProduct = async (ownerId:string,data:CreateProductInput) => {
    const user = await prisma?.user.findUnique({
        where:{id:ownerId},
        select:{role:true}
    })

    if(!user || (user.role !== 'OWNER' && user?.role !== 'ADMIN')){
        throw new AppError('Only owner and admin can create products',403)
    }

    const slug = await generateUniqueProductSlug(data.name,data.brand)

    const product = await prisma?.product.create({
        data:{
            ...data,
            slug,
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



export const getAllProducts = async (filters:{
    page?:number,
    limit?:number;
    search?:string;
    brand?:string;
    fragranceType?:string;
    minPrice?:number;
    maxPrice?:number;
    ownerId?:string
  }) => {
    const {page=1,limit=10,search,brand,fragranceType,minPrice,maxPrice,ownerId}=filters


    const  skip = (page-1)*limit

    const where:any={}

    if(search){
        where.OR=[
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },        ]
    }

    if(brand) {
        where.brand = { contains: brand, mode: 'insensitive' };
      }
    
      if (fragranceType) {
        where.fragranceType = fragranceType;
      }
    
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      if(ownerId){
        where.ownerId=ownerId
      }


      const [products,total] = await Promise.all([
        prisma?.product.findMany({
            where,
            skip,
            take:limit,
            include:{
                owner:{
                    select:{
                        id:true,
                        username:true,
                        avatar:true
                    }
                }
            },
            orderBy:{createdAt:'desc'}
        }),
        prisma?.product.count({where})
      ])


      return {
        products,
        pagination:{
            page,
            limit,
            total,
            totalPages:Math.ceil(total ?? 0/limit)
        }
      }

  }



  export const getProductBySlug = async (slug: string) => {
    const product = await prisma?.product.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            shop: {
              select: {
                id: true,
                name: true,
                description: true,
                address: true,
              },
            },
          },
        },
      },
    });
  
    if (!product) {
      throw new AppError('Product not found', 404);
    }
  
    return product;
  };



  export const getProductById = async (productId: string) => {
    const product = await prisma?.product.findUnique({
      where: { id:productId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            shop: {
              select: {
                id: true,
                name: true,
                description: true,
                address: true,
              },
            },
          },
        },
      },
    });
  
    if (!product) {
      throw new AppError('Product not found', 404);
    }
  
    return product;
  };



  export const updateProduct = async (
    productId: string,
    ownerId: string,
    data: UpdateProductInput
  ) => {
    const product = await prisma?.product.findUnique({
      where: { id: productId },
      select: { ownerId: true,name:true,brand:true,slug:true},
    });
  
    if (!product) {
      throw new AppError('product not found', 404);
    }
  
    const user = await prisma?.user.findUnique({
      where: { id: ownerId },
      select: { role: true },
    });
  
    if (product.ownerId !== ownerId && user?.role !== 'ADMIN') {
      throw new AppError('you not role for update product', 403);
    }
  
    const updatedProduct = await prisma?.product.update({
      where: { id: productId },
      data,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  
    return updatedProduct;
  };




  export const updateProductImage = async (
    productId: string,
    ownerId: string,
    fileBuffer: Buffer,
    originalName: string
  ) => {
    const product = await prisma?.product.findUnique({
      where: { id: productId },
      select: { ownerId: true, imageUrl: true },
    });
  
    if (!product) {
      throw new AppError('product not found', 404);
    }
  
    const user = await prisma?.user.findUnique({
      where: { id: ownerId },
      select: { role: true },
    });
  
    if (product.ownerId !== ownerId && user?.role !== 'ADMIN') {
      throw new AppError('your are not role for updated', 403);
    }
  
    if (product.imageUrl) {
      await deleteImage(product.imageUrl);
    }
  
    const imageUrl = await uploadImage(
      fileBuffer,
      originalName,
      'perfume-shop/products'
    );
  
    const updatedProduct = await prisma?.product.update({
      where: { id: productId },
      data: { imageUrl },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  
    return updatedProduct;
  };



  export const deleteProduct = async (productId: string, ownerId: string) => {
    const product = await prisma?.product.findUnique({
      where: { id: productId },
      select: { ownerId: true, imageUrl: true },
    });
  
    if (!product) {
      throw new AppError('product nor found', 404);
    }
  
    const user = await prisma?.user.findUnique({
      where: { id: ownerId },
      select: { role: true },
    });
  
    if (product.ownerId !== ownerId && user?.role !== 'ADMIN') {
      throw new AppError('your are not role for updated', 403);
    }
  
    if (product.imageUrl) {
      await deleteImage(product.imageUrl);
    }
  
    await prisma?.product.delete({
      where: { id: productId },
    });
  
    return { message: 'Продукт успешно удален' };
  };
  
 
  export const getOwnerProducts = async (ownerId: string) => {
    const products = await prisma?.product.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  
    return products;
  };



  export const getOwnerProductsStats = async (ownerId: string) => {
    const stats = await prisma?.product.aggregate({
      where: { ownerId },
      _count: { id: true },
      _sum: { quantity: true },
      _avg: { price: true },
    });
  
    const uniqueBrands = await prisma?.product.findMany({
      where: { ownerId },
      select: { brand: true },
      distinct: ['brand'],
    });
  
    const uniqueFragranceTypes = await prisma?.product.findMany({
      where: { ownerId },
      select: { fragranceType: true },
      distinct: ['fragranceType'],
    });
  
    return {
      totalProducts: stats?._count.id || 0,
      totalQuantity: stats?._sum.quantity || 0,
      averagePrice: stats?._avg.price || 0,
      uniqueBrands: uniqueBrands?.length,
      uniqueFragranceTypes: uniqueFragranceTypes?.length,
    };
  };




