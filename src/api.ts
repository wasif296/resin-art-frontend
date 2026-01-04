import axios from "axios";

export interface RecordData {
  _id?: string;
  type: 'Sale' | 'Purchase';
  date: string;
  itemName: string;
  quantity: number;
  unitPrice: number;   // Unit Price alag rakhi hai taake NaN na ho
  discount: number;    // Discount field
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  profit?: number;
}

const API_URL = "https://resin-backend.vercel.app/api/records";
const api = axios.create({ baseURL: API_URL });

export const getRecords = () => api.get<RecordData[]>("/");
export const addRecord = (data: RecordData) => api.post("/", data);
export const updateRecord = (id: string, data: RecordData) => api.put(`/${id}`, data);
export const deleteRecord = (id: string) => api.delete(`/${id}`);
export const loginUser = (credentials: { email: string; password?: string }) => api.post("/login", credentials);

export default api;