export interface ImgBBUploadResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: number;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

const IMGBB_API_KEY = "6143f435c50eb3cc39ae47ceec91719a";
const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

export async function uploadImageToImgBB(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  // Validate file
  if (!file) {
    throw new Error("No image file provided.");
  }

  // Max 32MB as supported by ImgBB
  const maxSize = 32 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size exceeds 32MB limit.");
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported image format. Please select JPEG, PNG, WEBP, or GIF.");
  }

  const formData = new FormData();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", file);

  // We use XMLHttpRequest for upload progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res: ImgBBUploadResponse = JSON.parse(xhr.responseText);
          if (res.success && res.data && res.data.url) {
            // Read direct hosted image url
            resolve(res.data.display_url || res.data.url);
          } else {
            reject(new Error("ImgBB response indicated failure: " + xhr.responseText));
          }
        } catch {
          reject(new Error("Failed to parse ImgBB response JSON."));
        }
      } else {
        try {
          const errorObj = JSON.parse(xhr.responseText);
          reject(new Error(errorObj.error?.message || `ImgBB upload failed with HTTP status ${xhr.status}`));
        } catch {
          reject(new Error(`ImgBB upload failed with HTTP status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network connection error while uploading image to ImgBB. Please retry."));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Image upload was cancelled."));
    });

    xhr.open("POST", IMGBB_ENDPOINT);
    xhr.send(formData);
  });
}
