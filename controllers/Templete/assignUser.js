const User = require("../../models/User");

const assignUser = async (req, res, next) => {
    const { userId, max, min, fileId } = req.body;
  
    try {
    //   const user = await User.findOne({ where: { id: userId } });
    //   if (!user) {
    //     return res.status(404).json({ error: 'User not found' });
    //   }
  
      await User.update(
        { max, min, fileId }, // New values to be updated
        { where: { id: userId } } // Condition to find the user
      );
  
      return res.status(200).json({ message: 'User assigned successfully' });
    } catch (error) {
      console.error('Error assigning user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

module.exports = assignUser;
