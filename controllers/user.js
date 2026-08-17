export default ({ entityId, model, populatedFields, emailModel, phoneNumberModel, addressModel }) => {

  async function getInfo(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(404).json({
          message: `${entityId} not found.`
        });
      }

      // fetch user + email + phoneNumber + addresses in parallel, each an indexed lookup
      const [userData, email, phoneNumber, addresses] = await Promise.all([
        model.getById(req.session.userId, { populate: populatedFields }),
        emailModel?.getOne({ owner: req.session.userId, ownerType: "User" }),
        phoneNumberModel?.getOne({ owner: req.session.userId, ownerType: "User" }),
        addressModel?.getByCoincidence({ owner: req.session.userId, ownerType: "User" }),
      ]);

      if (!userData) {
        return res.status(404).json({ message: `${entityId} not found.` });
      }

      const plainUser = userData.toObject ? userData.toObject() : userData;

      return res.json({
        ...plainUser,
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        addresses: addresses ?? [],
      });
    } catch (error) {
      res.status(500).json({
        message: `${entityId} list error.`,
        error: error.message || error,
      });
    }
  }

  async function register(req, res) {
    try {
      const { email, phoneNumber, addresses, ...userFields } = req.body;
      const newUser = await model.save(userFields);

      try {
        const [emailDoc, phoneNumberDoc, addressDocs] = await Promise.all([
          email
            ? emailModel.save({ email, owner: newUser._id, ownerType: "User" })
            : null,
          phoneNumber
            ? phoneNumberModel.save({ ...phoneNumber, owner: newUser._id, ownerType: "User" })
            : null,
          Promise.all(
            (addresses ?? []).map((address) =>
              addressModel.save({ ...address, owner: newUser._id, ownerType: "User" }),
            ),
          ),
        ]);

        const plainUser = newUser.toObject ? newUser.toObject() : newUser;

        res.status(201).json({
          ...plainUser,
          email: emailDoc,
          phoneNumber: phoneNumberDoc,
          addresses: addressDocs,
        });
      } catch (linkError) {
        // avoid an orphaned user document when email/phoneNumber/address creation fails
        await model.delete(newUser._id);
        throw linkError;
      }
    } catch (error) {
      res.status(400).json({
        message: `${entityId} register error.`,
        error: error.message,
      });
    }
  }

  async function update(req, res) {
    try {
      const updatedData = await model.update(req.session.userId, req.body, {
        populate: populatedFields,
      });

      if (!updatedData) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json(updatedData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error update.`,
        error: error.message || error,
      });
    }
  }

  return {
    getInfo,
    register,
    update,
  };
};
