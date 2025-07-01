require('dotenv').config();
const db = require('./models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established.');
    await db.sequelize.sync({ alter: true });
    console.log('All models synchronized.');
    // Optionally seed default roles and permissions
    await db.Role.createDefaultRoles();
    await db.Permission.createDefaultPermissions();
    console.log('Default roles and permissions seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Database sync error:', err);
    process.exit(1);
  }
})();
