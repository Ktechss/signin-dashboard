/**
 * API Client - Base configuration for all API requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Request interceptors
const requestInterceptors = [];
const responseInterceptors = [];

/**
 * Add a request interceptor
 * @param {Function} interceptor - Function that receives and returns config
 */
export function addRequestInterceptor(interceptor) {
  requestInterceptors.push(interceptor);
}

/**
 * Add a response interceptor
 * @param {Function} interceptor - Function that receives and returns response
 */
export function addResponseInterceptor(interceptor) {
  responseInterceptors.push(interceptor);
}

/**
 * Apply request interceptors
 */
function applyRequestInterceptors(config) {
  return requestInterceptors.reduce((conf, interceptor) => interceptor(conf), config);
}

/**
 * Apply response interceptors
 */
function applyResponseInterceptors(response) {
  return responseInterceptors.reduce((res, interceptor) => interceptor(res), response);
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  let config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Apply request interceptors
  config = applyRequestInterceptors(config);

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorObj = new Error(error.message || `HTTP error! status: ${response.status}`);
      errorObj.status = response.status;
      errorObj.data = error;
      throw errorObj;
    }

    let data = await response.json();

    // Apply response interceptors
    data = applyResponseInterceptors(data);

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * GET request
 */
export function get(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`${endpoint}${query ? `?${query}` : ''}`);
}

/**
 * POST request
 */
export function post(endpoint, data = {}) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export function put(endpoint, data = {}) {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request
 */
export function patch(endpoint, data = {}) {
  return request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export function del(endpoint) {
  return request(endpoint, {
    method: 'DELETE',
  });
}

// Export client object for convenience
const client = {
  request,
  get,
  post,
  put,
  patch,
  delete: del,
  addRequestInterceptor,
  addResponseInterceptor,
};

export default client;
