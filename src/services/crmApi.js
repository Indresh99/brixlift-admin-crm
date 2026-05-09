import { emitToast } from "../toast/toastEvents";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.brixlift.com";
const API_ROOT = `${API_BASE_URL}/api`;

export const authStorage = {
  getToken: () => localStorage.getItem("brixlift_admin_token"),
  setSession: ({ token, user }) => {
    localStorage.setItem("brixlift_admin_token", token);
    localStorage.setItem("brixlift_admin_user", JSON.stringify(user));
  },
  getUser: () => {
    const raw = localStorage.getItem("brixlift_admin_user");
    return raw ? JSON.parse(raw) : null;
  },
  clear: () => {
    localStorage.removeItem("brixlift_admin_token");
    localStorage.removeItem("brixlift_admin_user");
  },
};

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = authStorage.getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    emitToast(message);
    const error = new Error(message);
    error.toastShown = true;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function requestBlob(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = authStorage.getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    emitToast(message);
    const error = new Error(message);
    error.toastShown = true;
    throw error;
  }

  return response.blob();
}

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    return (
      payload.message ||
      payload.error ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

function post(path, body) {
  return request(path, { method: "POST", body: JSON.stringify(body) });
}

function postForm(path, formData) {
  return request(path, { method: "POST", body: formData });
}

function toQueryString(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

function patch(path, body) {
  return request(path, { method: "PATCH", body: JSON.stringify(body) });
}

function put(path, body) {
  return request(path, { method: "PUT", body: JSON.stringify(body) });
}

function deleteRequest(path, body) {
  return request(path, {
    method: "DELETE",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export const crmApi = {
  login: (payload) => post("/auth/login", payload),
  signup: (payload) => post("/auth/signup", payload),
  getMe: () => request("/me"),
  getUsers: () => request("/users"),
  getAssignableUsers: () => request("/users/assignees"),
  createUser: (payload) => post("/users", payload),
  getDashboardSummary: () => request("/dashboard/summary"),
  getDashboardPipeline: () => request("/dashboard/pipeline"),
  getDashboardTasks: () => request("/dashboard/tasks"),
  getActivities: () => request("/activities"),
  getLeads: () => request("/leads"),
  createLead: (payload) => post("/leads", payload),
  updateLead: (id, payload) => patch(`/leads/${id}`, payload),
  deleteLead: (id, payload) => deleteRequest(`/leads/${id}`, payload),
  convertLeadToCustomer: (id) => post(`/leads/${id}/convert-to-customer`),
  getLeadFilters: () => request("/filters/leads"),
  uploadLeadsExcel: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return postForm("/leads/excel/upload", formData);
  },
  downloadLeadsExcel: (filters) =>
    requestBlob(`/leads/excel/download${toQueryString(filters)}`),
  getCustomers: () => request("/customers"),
  updateCustomer: (id, payload) => patch(`/customers/${id}`, payload),
  getProjects: () => request("/projects"),
  updateProject: (id, payload) => patch(`/projects/${id}`, payload),
  getReports: () => request("/reports"),
  getProperties: () => request("/properties"),
  getProperty: (id) => request(`/properties/${id}`),
  createProperty: (payload) => post("/properties", payload),
  updateProperty: (id, payload) => put(`/properties/${id}`, payload),
  deleteProperty: (id) => deleteRequest(`/properties/${id}`),
  uploadPropertyImages: (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));
    return postForm("/properties/images", formData);
  },
};
