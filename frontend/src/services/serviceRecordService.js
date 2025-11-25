import axios from "axios";

const API_URL = "http://localhost:9090/api/service-records";

export const getServiceRecords = () => axios.get(API_URL);

export const getServiceRecordById = (id) =>
  axios.get(`${API_URL}/${id}`);

export const addServiceRecord = (record) =>
  axios.post(API_URL, record);

export const updateServiceRecord = (id, record) =>
  axios.put(`${API_URL}/${id}`, record);

export const deleteServiceRecord = (id) =>
  axios.delete(`${API_URL}/${id}`);
