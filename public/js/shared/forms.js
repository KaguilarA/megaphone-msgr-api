const forms = new (class {
  async handleSubmit({ requestFn, state, redirectUrl, onError }) {
    state.loading = true;
    try {
      await requestFn();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      state.loading = false;
    }
  }

  addListItem(list, defaultItem) {
    list.push({ ...defaultItem });
  }

  removeListItem(list, index, minLength = 0) {
    if (list.length > minLength) {
      list.splice(index, 1);
    }
  }
})();
