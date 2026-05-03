import axios from "axios";

export function getApiBaseURL() {
  const env = import.meta.env.VITE_API_URL;
  if (env) {
    return String(env).replace(/\/+$/, "");
  }
  return "/api";
}

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
