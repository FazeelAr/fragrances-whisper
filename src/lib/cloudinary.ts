import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function uploadProductImage(
  fileBase64: string,
  productSlug: string
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder: `fragrance-whisper/products/${productSlug}`,
    transformation: [
      { width: 800, height: 800, crop: "fill", gravity: "center" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteProductImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
