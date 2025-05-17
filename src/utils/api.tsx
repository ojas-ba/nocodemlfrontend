import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api.nocodeml.cloud',
  withCredentials: true,
});
