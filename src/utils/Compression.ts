import imageCompression, { Options } from 'browser-image-compression';

type FileCompressionDetails = {
    file: File;
    originalSizeMB: string;
    compressedSizeMB: string;
};

/**
 * Compresses an image and optionally converts it to WebP format.
 * 
 * @param {File} file - The original image file from an <input type="file">
 * @param {Object} [customOptions] - Optional overrides for compression settings
 * @returns {Promise<FileCompressionDetails>}
 */
export async function compressImage(file: File, customOptions?: Partial<Options>): Promise<FileCompressionDetails> {
    // 1. Validate input
    if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please provide an image.');
    }

    // 2. Set sensible default options for web uploads
    const defaultOptions: Options = {
        maxSizeMB: 1,             // Max file size in MB
        maxWidthOrHeight: 1920,   // Max dimensions (1080p / HD)
        useWebWorker: true,       // Use multi-threading to keep UI responsive
        fileType: 'image/webp',   // Force conversion to WebP
        initialQuality: 0.8,      // 80% quality is a great balance of size/looks
    };

    // Merge defaults with any custom options passed in
    const options = { ...defaultOptions, ...customOptions };

    try {
        // 3. Perform the compression
        const compressedBlob = await imageCompression(file, options);

        // 4. Fix the filename extension
        // If original is "my.photo.jpg", we want "my.photo.webp"
        const lastDotIndex = file.name.lastIndexOf('.');
        const originalNameWithoutExt = lastDotIndex !== -1
            ? file.name.substring(0, lastDotIndex)
            : file.name;

        const newExtension = options.fileType === 'image/webp' ? 'webp' : file.name.split('.').pop();
        const newFileName = `${originalNameWithoutExt}.${newExtension}`;

        // 5. Convert the resulting Blob back into a File object
        // Supabase works best with File objects that have clear names and types
        const finalFile = new File([compressedBlob], newFileName, {
            type: options.fileType || compressedBlob.type,
            lastModified: Date.now(),
        });

        // 6. Return the file along with helpful metadata
        return {
            file: finalFile,
            originalSizeMB: (file.size / 1024 / 1024).toFixed(3),
            compressedSizeMB: (finalFile.size / 1024 / 1024).toFixed(3),
        };

    } catch (error) {
        console.error('Image compression failed:', error);
        throw new Error('Failed to compress image');
    }
}