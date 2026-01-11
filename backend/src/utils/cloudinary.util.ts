import cloudinary from '../config/cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import DatauriParser from 'datauri/parser';
import path from 'path';

const parser = new DatauriParser();

export class CloudinaryUtil {

  static async uploadImage(
    fileBuffer: Buffer,
    originalName: string,
    folder: string = 'perfume-shop'
  ): Promise<string> {
    try {
      const extName = path.extname(originalName).toString();
      const file64 = parser.format(extName, fileBuffer);

      if (!file64.content) {
        throw new Error('dont access download');
      }

      const result: UploadApiResponse = await cloudinary.uploader.upload(
        file64.content,
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        }
      );

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('dont access download');
    }
  }

  
  static async uploadMultipleImages(
    files: Array<{ buffer: Buffer; originalname: string }>,
    folder: string = 'perfume-shop'
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadImage(file.buffer, file.originalname, folder)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw new Error('dont access download');
    }
  }

  
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
        const urlParts = imageUrl.split("/");
    
        const fileName = urlParts.at(-1);
        const folder = urlParts.at(-2);
    
        if (!fileName || !folder) {
          throw new Error("Invalid Cloudinary URL");
        }
    
        const publicId = fileName.split(".")[0];
        const fullPublicId = `${folder}/${publicId}`;
    
        await cloudinary.uploader.destroy(fullPublicId);
      } catch (error) {
        console.error("Cloudinary delete error:", error);
      }
  }


  static async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    try {
      const deletePromises = imageUrls.map((url) => this.deleteImage(url));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Multiple delete error:', error);
    }
  }


  static getOptimizedUrl(
    imageUrl: string,
    width?: number,
    height?: number
  ): string {
    if (!imageUrl.includes('cloudinary.com')) {
      return imageUrl;
    }

    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push('q_auto', 'f_auto');

    const transformation = transformations.join(',');
    return imageUrl.replace('/upload/', `/upload/${transformation}/`);
  }

 
  static isImageFile(mimetype: string): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    return allowedMimeTypes.includes(mimetype);
  }

  static validateFileSize(size: number, maxSize: number = 5 * 1024 * 1024): boolean {
    return size <= maxSize;
  }
}



export const uploadImage = CloudinaryUtil.uploadImage
export const uploadMultipleImage = CloudinaryUtil.uploadMultipleImages
export const deleteImage = CloudinaryUtil.deleteImage
export const deleteMultipleImages = CloudinaryUtil.deleteMultipleImages
export const getOptimizedUrl = CloudinaryUtil.getOptimizedUrl
export const isImageUrl = CloudinaryUtil.isImageFile
export const validateFileSize = CloudinaryUtil.validateFileSize


