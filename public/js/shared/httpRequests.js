const httpRequests = (() => {
  async function doRequest(url, options = {}) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      if (response.status === 204) return true;

      return await response.json();
    } catch (error) {
      console.error(`[HTTP Error] ${options.method} -> ${url}:`, error);
      throw error;
    }
  }

  const deleteRequest = (url) => doRequest(url, { method: "DELETE" });

  const getRequest = (url) => doRequest(url, { method: "GET" });

  const postRequest = (url, body) =>
    doRequest(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  const putRequest = (url, body) =>
    doRequest(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  return {
    delete: deleteRequest,
    get: getRequest,
    post: postRequest,
    put: putRequest,
  };
})();
