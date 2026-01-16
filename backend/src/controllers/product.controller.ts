import type { Request, Response } from "express";
import * as productService from '../services/product.service';
import { success } from "zod";






export const createProduct = async (req:Request,res:Response) => {
    const ownerId = req.user!.userId
    const data = req.body

    const product = await productService.createProduct(ownerId,data)

    res.status(201).json({
        success:true,
        message:'Product created',
        data:product
    })

}



export const createProductWithImage = async (req: Request, res: Response) => {
    const ownerId = req.user!.userId;
    const data = req.body;
  
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'imagte not presented',
      });
    }
  
    const product = await productService.createProductWithImage(
      ownerId,
      data,
      req.file.buffer,
      req.file.originalname
    );
  
    res.status(201).json({
      success: true,
      message: 'product created with image',
      data: product,
    });

}


export const getAllProducts = async (req: Request, res: Response) => {
    const {
      page,
      limit,
      search,
      brand,
      fragranceType,
      minPrice,
      maxPrice,
      ownerId,
    } = req.query;
  
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      brand: brand as string,
      fragranceType: fragranceType as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      ownerId: ownerId as string,
    };
  
    const result = await productService.getAllProducts(filters);
  
    res.json({
      success: true,
      data: result,
    });

}



export  const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product id is required',
        });
      }

  
    const product = await productService.getProductById(id);
  
    res.json({
      success: true,
      data: product,
    });

}



export  const getProductBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
          success: false,
          message: 'Product id is required',
        });
      }

  
    const product = await productService.getProductBySlug(slug);
  
    res.json({
      success: true,
      data: product,
    });

}





export const updateProduct = async (req:Request,res:Response) => {
    const {id} = req.params
    const ownerId = req.user?.userId
    const data = req.body   

    if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product id is required',
        });
      }


      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Product id is required',
        });
      }

    const product = await productService.updateProduct(id,ownerId,data)



    res.json({success:true,message:'Product updated',data:product})


}




export const updateProductImage = async (req:Request,res:Response) => {
    const {id} = req.params
    const ownerId = req.user?.userId

    if(!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image not presented',
        });
      }

    if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product id is required',
        });
      }


      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Product id is required',
        });
      }



    const product = await productService.updateProductImage(id,ownerId,req.file.buffer,req.file.originalname)



    res.json({success:true,message:'Product updated',data:product})


}



export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const ownerId = req.user!.userId;

    if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Product id is required',
        });
      }
  
    const result = await productService.deleteProduct(id, ownerId);
  
    res.json({
      success: true,
      message: result.message,
    });

}




export const getOwnerProducts = async (req: Request, res: Response) => {
    const ownerId = req.user!.userId;
  
    const products = await productService.getOwnerProducts(ownerId);
  
    res.json({
      success: true,
      data: products,
    });
}


export const getOwnerProductsStats = async (req: Request, res: Response) => {
    const ownerId = req.user!.userId;
  
    const stats = await productService.getOwnerProductsStats(ownerId);
  
    res.json({
      success: true,
      data: stats,
    });

}