import axios from "axios";

const BASE_URL = "http://localhost:5002";

const getAuthHeader = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ---------- Auth ----------

export const register = (data) => {
  return axios.post(`${BASE_URL}/auth/register`, data);
};

export const login = (data) => {
  return axios.post(`${BASE_URL}/auth/login`, data);
};

// ---------- Organizations ----------

export const getOrganizations = (token, params = {}) => {
  return axios.get(`${BASE_URL}/organizations`, {
    ...getAuthHeader(token),
    params,
  });
};

export const addOrganization = (data, token) => {
  return axios.post(`${BASE_URL}/organizations`, data, getAuthHeader(token));
};

export const updateOrganization = (id, data, token) => {
  return axios.put(`${BASE_URL}/organizations/${id}`, data, getAuthHeader(token));
};

export const deleteOrganization = (id, token) => {
  return axios.delete(`${BASE_URL}/organizations/${id}`, getAuthHeader(token));
};

// ---------- Workspaces ----------

export const getWorkspaces = (token, params = {}) => {
  return axios.get(`${BASE_URL}/workspaces`, {
    ...getAuthHeader(token),
    params,
  });
};

export const addWorkspace = (data, token) => {
  return axios.post(`${BASE_URL}/workspaces`, data, getAuthHeader(token));
};

export const updateWorkspace = (id, data, token) => {
  return axios.put(`${BASE_URL}/workspaces/${id}`, data, getAuthHeader(token));
};

export const deleteWorkspace = (id, token) => {
  return axios.delete(`${BASE_URL}/workspaces/${id}`, getAuthHeader(token));
};

// ---------- Workspace Users (members & roles) ----------

export const getWorkspaceUsers = (workspaceId, token) => {
  return axios.get(`${BASE_URL}/workspaces/${workspaceId}/users`, getAuthHeader(token));
};

export const addWorkspaceUser = (data, token) => {
  return axios.post(`${BASE_URL}/workspaces/users`, data, getAuthHeader(token));
};

export const updateWorkspaceUserRole = (id, role, token) => {
  return axios.put(
    `${BASE_URL}/workspaces/users/${id}`,
    { role },
    getAuthHeader(token),
  );
};

export const removeWorkspaceUser = (id, token) => {
  return axios.delete(`${BASE_URL}/workspaces/users/${id}`, getAuthHeader(token));
};

// ---------- Dashboard ----------

export const getDashboard = (token) => {
  return axios.get(`${BASE_URL}/dashboard`, getAuthHeader(token));
};
