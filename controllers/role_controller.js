const Role = require("../models/Role");
const Joi = require("joi");
const logger = require("../utils/logger");

module.exports.get_roles = async (req, res) => {
  try {
    const roles = await Role.find();
    return res.send({
      success: true,
      data: roles,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.get_role = async (req, res) => {
  const { roleId } = req.params;
  try {
    const role = await Role.findById(roleId);

    if (!role)
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });

    return res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.create_role = async (req, res) => {
  const { name } = req.body;
  const schema = Joi.object().keys({
    name: Joi.string().min(2).required(),
  });
  const data = { name };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const role = await Role.create(data);
    return res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.update_role = async (req, res) => {
  const { name } = req.body;
  const { roleId } = req.params;

  const schema = Joi.object().keys({
    name: Joi.string().min(2).required(),
  });
  const data = { name };
  const result = schema.validate(data);

  if (result.error) {
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    const roleToUpdate = await Role.findById(roleId);
    if (!roleToUpdate)
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });

    roleToUpdate.name = name;

    await roleToUpdate.save();

    return res.json({
      success: true,
      data: roleToUpdate,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.delete_role = async (req, res) => {
  const { roleId } = req.params;
  try {
    await Role.deleteOne({ roleId });

    return res.json({
      success: true,
      data: "role deleted!",
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({ error: error.message });
  }
};

module.exports.migrate_roles = async (req, res) => {
  const schema = Joi.object().keys({
    name: Joi.string().alphanum().min(2).required(),
  });
  const adminRole = { name: "admin" };
  const staffRole = { name: "user" };

  let result = schema.validate(adminRole);
  if (result.error) {
    logger.error(err.message);
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }
  result = schema.validate(staffRole);
  if (result.error) {
    logger.error(err.message);
    return res.status(400).send({
      success: false,
      message: result.error.details[0].message,
    });
  }

  try {
    await Role.create(adminRole);
    await Role.create(staffRole);

    const roles = await Role.find();
    return res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    logger.error(err.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
