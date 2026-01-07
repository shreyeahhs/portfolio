export const API_BASE = (import.meta as any).env.VITE_API_BASE || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
    CONTACT: `${API_BASE}/api/contact`,
    CHAT: `${API_BASE}/api/chat`,
    PROJECTS: `${API_BASE}/api/projects`,
    INTERNSHIPS: `${API_BASE}/api/internships`,
    HEALTH: `${API_BASE}/api/health`,
};
