const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize with configuration
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool
  }
);

// Import all models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Company = require('./Company')(sequelize, Sequelize.DataTypes);
const Role = require('./Role')(sequelize, Sequelize.DataTypes);
const Permission = require('./Permission')(sequelize, Sequelize.DataTypes);
const Integration = require('./Integration')(sequelize, Sequelize.DataTypes);
const Setting = require('./Setting')(sequelize, Sequelize.DataTypes);
const Customer = require('./Customer')(sequelize, Sequelize.DataTypes);
const Estimate = require('./Estimate')(sequelize, Sequelize.DataTypes);
const EstimateItem = require('./EstimateItem')(sequelize, Sequelize.DataTypes);
const Project = require('./Project')(sequelize, Sequelize.DataTypes);
const FileUpload = require('./FileUpload')(sequelize, Sequelize.DataTypes);
const Invoice = require('./Invoice')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const Task = require('./Task')(sequelize, Sequelize.DataTypes);
const Note = require('./Note')(sequelize, Sequelize.DataTypes);
const Notification = require('./Notification')(sequelize, Sequelize.DataTypes);

// Define associations
const db = {
  sequelize,
  Sequelize,
  User,
  Company,
  Role,
  Permission,
  Integration,
  Setting,
  Customer,
  Estimate,
  EstimateItem,
  Project,
  FileUpload,
  Invoice,
  Payment,
  Task,
  Note,
  Notification
};

// User associations
User.belongsTo(Company, { foreignKey: 'companyId' });
User.belongsTo(Role, { foreignKey: 'roleId' });
Company.hasMany(User, { foreignKey: 'companyId' });
Role.hasMany(User, { foreignKey: 'roleId' });

// Role-Permission many-to-many
Role.belongsToMany(Permission, { through: 'RolePermissions', foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: 'RolePermissions', foreignKey: 'permissionId' });

// Company associations
Company.hasMany(Integration, { foreignKey: 'companyId' });
Company.hasMany(Setting, { foreignKey: 'companyId' });
Company.hasMany(Customer, { foreignKey: 'companyId' });
Company.hasMany(Estimate, { foreignKey: 'companyId' });
Company.hasMany(Project, { foreignKey: 'companyId' });
Company.hasMany(FileUpload, { foreignKey: 'companyId' });

// Customer associations
Customer.belongsTo(Company, { foreignKey: 'companyId' });
Customer.hasMany(Estimate, { foreignKey: 'customerId' });
Customer.hasMany(Project, { foreignKey: 'customerId' });
Customer.hasMany(Invoice, { foreignKey: 'customerId' });

// Estimate associations
Estimate.belongsTo(Company, { foreignKey: 'companyId' });
Estimate.belongsTo(Customer, { foreignKey: 'customerId' });
Estimate.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Estimate.hasMany(EstimateItem, { foreignKey: 'estimateId' });
Estimate.belongsTo(Project, { foreignKey: 'projectId' });

// EstimateItem associations
EstimateItem.belongsTo(Estimate, { foreignKey: 'estimateId' });

// Project associations
Project.belongsTo(Company, { foreignKey: 'companyId' });
Project.belongsTo(Customer, { foreignKey: 'customerId' });
Project.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Project.hasMany(Estimate, { foreignKey: 'projectId' });
Project.hasMany(Task, { foreignKey: 'projectId' });
Project.hasMany(FileUpload, { foreignKey: 'projectId' });
Project.hasMany(Note, { foreignKey: 'projectId' });

// File associations
FileUpload.belongsTo(Company, { foreignKey: 'companyId' });
FileUpload.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
FileUpload.belongsTo(Project, { foreignKey: 'projectId' });
FileUpload.belongsTo(Estimate, { foreignKey: 'estimateId' });

// Invoice associations
Invoice.belongsTo(Customer, { foreignKey: 'customerId' });
Invoice.belongsTo(Estimate, { foreignKey: 'estimateId' });
Invoice.belongsTo(Project, { foreignKey: 'projectId' });
Invoice.hasMany(Payment, { foreignKey: 'invoiceId' });

// Payment associations
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId' });
Payment.belongsTo(Customer, { foreignKey: 'customerId' });

// Task associations
Task.belongsTo(Project, { foreignKey: 'projectId' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Note associations
Note.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Note.belongsTo(Project, { foreignKey: 'projectId' });
Note.belongsTo(Customer, { foreignKey: 'customerId' });
Note.belongsTo(Estimate, { foreignKey: 'estimateId' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = db;
