module.exports = {
  username: process.env.DB_USER || 'crm_user',
  password: process.env.DB_PASS || 'crm_pass',
  database: process.env.DB_NAME || 'crm_db',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
