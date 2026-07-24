import DBModel from "./../utils/model.js";

export default DBModel("PhoneNumber", {
  phone: {
    type: String,
    required: [true, "El número de teléfono es obligatorio."],
    trim: true,
  },
  countryNumber: {
    type: String,
    required: [true, "El código de país es obligatorio."],
    trim: true,
  },
});
