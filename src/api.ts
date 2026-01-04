import axios from "axios";

export interface RecordData {
  _id?: string;
  type: 'Sale' | 'Purchase';
  date: string;
  itemName: string;
  quantity: number;
  unitPrice: number;   
  discount: number;    
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  profit?: number;
}

// 1. URL ko sahi kiya (resin-art-backend)
// 2. Aakhir mein slash (/) nahi lagaya taake routes sahi bante rahein
const API_URL = "https://resin-art-backend.vercel.app/api/records";

const api = axios.create({ 
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// API Functions
export const getRecords = () => api.get<RecordData[]>("/");
export const addRecord = (data: RecordData) => api.post("/", data);
export const updateRecord = (id: string, data: RecordData) => api.put(`/${id}`, data);
export const deleteRecord = (id: string) => api.delete(`/${id}`);

// Login Credentials typing
export const loginUser = (credentials: { email: string; password?: string }) => 
  api.post("/login", credentials);

export default api;