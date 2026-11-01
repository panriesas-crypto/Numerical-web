
import axios from "axios";

const api = axios.create({
  baseURL: (
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000/api"
  ).replace(/\/$/, ""),
  timeout: 12000,
});

export async function getPresets(category, method) {
  const { data } = await api.get("/presets", {
    params: { category, method },
  });

  return data;
}

export async function savePreset(payload, adminToken) {
  if (!adminToken) {
    throw new Error("Admin token is required");
  }

  const { data } = await api.post("/presets", payload, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  return data;
}
