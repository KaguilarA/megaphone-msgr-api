export class DBModel {
  constructor(model) {
    this.model = model;
  }

  async delete(id) {
    const deletedPhoneNumber = await this.model.findByIdAndDelete(id);
    return deletedPhoneNumber;
  }

  async getAll() {
    const phoneNumbers = await this.model.find();
    return phoneNumbers;
  }

  async getById(id) {
    const coincidence = await this.model.findById(id);
    return coincidence;
  }

  async save(data) {
    const newPhoneNumber = new this.model(data);
    const savedPhoneNumber = await newPhoneNumber.save();

    return savedPhoneNumber;
  }

  async update(id, data) {
    const updatedPhoneNumber = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return updatedPhoneNumber;
  }
}
