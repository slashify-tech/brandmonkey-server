import apiurl from './util';

const setupInterceptors = (tokenId) => {
  apiurl.interceptors.request.use(
    (config) => {
      // Add the tokenId to the request header
      if (tokenId) {
        config.headers.Authorization = `Bearer ${tokenId}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;