import { prisma } from '../config/database';




export const generateSlug = (text:string) : string => {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-') 
    .replace(/^-+|-+$/g, ''); 
}


export const generateUniqueProductSlug = async (name: string, brand: string): Promise<string> => {
    const baseSlug = generateSlug(`${name}-${brand}`);
    let slug = baseSlug;
    let counter = 1;
  
    while (true) {
      const existing = await prisma.product.findUnique({
        where: { slug },
      });
  
      if (!existing) {
        break;
      }
  
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  
    return slug;
  };
  

  export const generateUniqueShopSlug = async (name: string): Promise<string> => {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;
  
    while (true) {
      const existing = await prisma.shop.findUnique({
        where: { slug },
      });
  
      if (!existing) {
        break;
      }
  
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  
    return slug;
  };