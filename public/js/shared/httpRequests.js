const httpRequests = new (class {
  async #request(url, options = {}) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      if (response.status === 204) return true;

      return await response.json();
    } catch (error) {
      console.error(`[HTTP Error] ${options.method || 'GET'} -> ${url}:`, error);
      throw error;
    }
  }

  async get(url) {
    return this.#request(url, { method: 'GET' });
  }

  async post(url, body) {
    return this.#request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async put(url, body) {
    return this.#request(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async delete(url) {
    return this.#request(url, { method: 'DELETE' });
  }
})();