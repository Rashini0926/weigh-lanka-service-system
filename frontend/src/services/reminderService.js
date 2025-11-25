import axios from "axios";

const API = "http://localhost:9090/api/reminders";

export const getDueReminders = () => axios.get(`${API}/due`);

export const sendEmailReminder = (id) =>
  axios.post(`${API}/send-email/${id}`);

export const sendSmsReminder = (id) =>
  axios.post(`${API}/send-sms/${id}`);

export const sendBothReminders = (id) =>
  axios.post(`${API}/send-both/${id}`);
