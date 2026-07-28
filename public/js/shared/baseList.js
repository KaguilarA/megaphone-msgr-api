class APMViewList {
  currentPage = 1;
  perPage = 5;
  search = "";
  sortAsc = true;

  get baseUrl() { 
    return `/api/${this.id}/`;
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