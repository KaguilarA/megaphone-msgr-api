import { Schema, model } from "mongoose";

/**
 * @class DBModel
 * @description Clase genérica para gestionar operaciones CRUD básicas utilizando Mongoose.
 */
export default (id, schema) =>
  new (class {
    /**
     * Crea una instancia del modelo de base de datos.
     * @constructor
     * @param {string} id - El nombre identificador del modelo en Mongoose.
     * @param {import('mongoose').SchemaDefinition} schema - La definición del esquema de Mongoose.
     */
    constructor(id, schema) {
      this.schema = new Schema(schema, { timestamps: true });
      this.id = id;
      this.model = model(this.id, this.schema);
    }

    /**
     * Elimina un documento por su ID.
     * @async
     * @param {string} id - El ID del documento a eliminar.
     * @returns {Promise<import('mongoose').Document|null>} El documento eliminado o null si no se encuentra.
     */
    async delete(id) {
      return await this.model.findByIdAndDelete(id);
    }

    /**
     * Obtiene todos los documentos de la colección.
     * @async
     * @returns {Promise<import('mongoose').Document[]>} Una lista con todos los documentos.
     */
    async getAll(options = {}) {
      let query = this.model.find();
      if (options.populate) {
        options.populate.forEach((field) => {
          query = query.populate(field);
        });
      }
      const data = await query;
      data.forEach((doc) => {
        console.log(doc);
      });
      return data;
    }

    /**
     * Busca un documento por su ID.
     * @async
     * @param {string} id - El ID del documento a buscar.
     * @returns {Promise<import('mongoose').Document|null>} El documento encontrado o null si no existe.
     */
    async getById(id, options = {}) {
      let query = this.model.findById(id);
      if (options.populate) {
        options.populate.forEach((field) => {
          query = query.populate(field);
        });
      }
      return await query;
    }

    /**
     * Guarda un nuevo documento en la base de datos.
     * @async
     * @param {Object} data - Los datos del documento a guardar.
     * @returns {Promise<import('mongoose').Document>} El documento recién guardado.
     */
    async save(data) {
      const newData = new this.model(data);
      const savedData = await newData.save();

      return savedData;
    }

    /**
     * Actualiza un documento existente por su ID.
     * @async
     * @param {string} id - El ID del documento a actualizar.
     * @param {Object} data - Los nuevos datos para actualizar.
     * @returns {Promise<import('mongoose').Document|null>} El documento actualizado o null si no se encuentra.
     */
    async update(id, data, options = {}) {
      let query = this.model.findByIdAndUpdate(id, data, {
        new: true,
        ...options,
      });
      if (options.populate) {
        options.populate.forEach((field) => {
          query = query.populate(field);
        });
      }
      return await query;
    }
  })(id, schema);
