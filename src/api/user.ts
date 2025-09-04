import apiClient from "./client";

export const userApi = {
  me: () => apiClient.get("/user/me"),
  maintenanceStatus: () => apiClient.get("/user/maintenance/status"),
  updatePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post("/user/update/password", { oldPassword, newPassword }),
  sendNotification: (message: string) =>
    apiClient.post("/user/send", { message }),
};
