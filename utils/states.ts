import { StateModel } from "../models/models.js";

class States { 

  async getStateByType(type) {
    try {
      const state = await StateModel.getByCoincidence({ entity: type });
      return state;
    } catch (error) {
      throw new Error(`Error getting state by type: ${error.message}`);
    }
  }

  async getAllStates() {
    try {
      const states = await StateModel.getAll();
      return states;
    } catch (error) {
      throw new Error(`Error getting all states: ${error.message}`);
    }
  }

  async getStateByNameAndEntity(name, entity) {
    try {
      const state = await StateModel.getByCoincidence({
        name,
        entity,
      });
      return state;
    } catch (error) {
      throw new Error(`Error getting state by name and entity: ${error.message}`);
    }
  }
}

export const states = new States();