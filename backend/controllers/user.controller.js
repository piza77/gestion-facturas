// controllers/user.controller.js

exports.getUsers = (req, res) => res.json({ message: "getUsers OK" });
exports.getUserById = (req, res) => res.json({ message: "getUserById OK" });
exports.createUser = (req, res) => res.json({ message: "createUser OK" });
exports.updateUser = (req, res) => res.json({ message: "updateUser OK" });
exports.deleteUser = (req, res) => res.json({ message: "deleteUser OK" });
exports.loginUser = (req, res) => res.json({ message: "loginUser OK" });