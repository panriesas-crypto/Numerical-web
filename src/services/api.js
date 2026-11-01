import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 5000,
});
export async function getPresets(category, method) {
  const { data } = await api.get("/presets", { params: { category, method } });
  return data;
}
export async function savePreset(payload) {
  const { data } = await api.post("/presets", payload);
  return data;
}
