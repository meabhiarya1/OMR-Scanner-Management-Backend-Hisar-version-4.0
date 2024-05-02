const User = require('../../models/User');

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userRole = req.role;
  if(userRole !== "Admin"){
    return res.status(500).json({msg: "Only Admin can create user"});
  }
  console.log(id,"id")

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.status(201).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = deleteUser;
