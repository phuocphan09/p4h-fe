import axios from 'axios';
import qs from 'qs';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'content-type': 'application/json',
  },
  // withCredentials: true,
  paramsSerializer: params => qs.stringify(params),
});

axiosClient.interceptors.response.use(
  response => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  error => {
    // Handle errors
    throw error;
  }
);
export default axiosClient;
