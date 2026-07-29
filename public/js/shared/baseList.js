class APMViewList {
  currentPage = 1;
  perPage = 5;
  search = "";
  sortAsc = true;

  get baseUrl() {
    return `/api/${this.id}/`;
  }

  get filteredList() {
    const list = Array.isArray(this.dataList) ? this.dataList : [];
    let result = list;

    if (this.search.trim()) result = this.searchResult;
    if (!Array.isArray(result)) result = [];

    return result.sort((a, b) => {
      let valA = a[this.sortBy] || "";
      let valB = b[this.sortBy] || "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });
  }

  get paginatedList() {
    const start = (this.currentPage - 1) * this.perPage;
    return this.filteredList.slice(start, start + this.perPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredList.length / this.perPage) || 1;
  }

  constructor(dataList = [], id = "viewList") {
    this.dataList = dataList;
    this.id = id;
  }

  navigateToUrl(url) {
    window.location.href = url;
  }

  navigateToAdd() {
    this.navigateToUrl(`/${this.id}/new`);
  }

  navigateToEdit(id) {
    this.navigateToUrl(`/${this.id}/${id}/edit`);
  }

  setPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  sort(column) {
    if (this.sortBy === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = column;
      this.sortAsc = true;
    }
  }
}
