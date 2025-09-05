import apiClient from "./client";

export const mediaApi = {
  getBucket: (bucket: string) => apiClient.get(`/media/get-bucket/${bucket}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/media/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
