import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000", // FastAPI backend
});

export const signup = (email: string, password: string, role: string) =>
    api.post("/auth/signup", { email, password, role });

export const login = (email: string, password: string) =>
    api.post("/auth/login", { email, password });

export const getRisks = () => api.get("/risks/");
export const addRisk = (risk: { name: string; description: string; mitigation_strategy: string }) =>
    api.post("/risks/", risk);

export const getRiskTable = (pmId: string) => api.get(`/risk-tables/${pmId}`);
export const addToRiskTable = (pmId: string, item: { risk_scenario_id: string; mitigation_status: string }) =>
    api.post(`/risk-tables/${pmId}/add`, item);

export const getAllRiskTables = () => api.get("/risk-tables/");
export const getDashboardStats = () => api.get("/dashboard/stats");
export const updateMitigationStatus = (pmId: string, itemId: string, status: string) =>
    api.put(`/risk-tables/${pmId}/update/${itemId}`, { mitigation_status: status });

export const deleteRiskTableItem = (pmId: string, itemId: string) =>
    api.delete(`/risk-tables/${pmId}/delete/${itemId}`);

export default api;
