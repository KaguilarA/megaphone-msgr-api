const parsers = new (class {

  cleanPhones(phones = []) {
    return phones.filter((p) => p.phone && p.phone.trim() !== "");
  }

  cleanEmails(emails = []) {
    return emails.filter((e) => e.email && e.email.trim() !== "");
  }

  cleanAddresses(addresses = []) {
    return addresses.filter(
      (a) =>
        (a.street && a.street.trim() !== "") ||
        (a.city && a.city.trim() !== ""),
    );
  }

  formatPhone(countryNumber, phone) {
    if (!phone) return "";
    return `${countryNumber} ${phone}`.trim();
  }

  formatAddress(addr) {
    if (!addr) return "";
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.country,
    ];
    return parts.filter(Boolean).join(", ");
  }
})();
