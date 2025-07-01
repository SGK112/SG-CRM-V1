module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      }
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Setting key (e.g., company.name, email.smtp.host, etc.)'
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Setting value (can be string, number, boolean, object, array)'
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'object', 'array'),
      allowNull: false,
      defaultValue: 'string'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general',
      comment: 'Setting category (general, email, integrations, etc.)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this setting can be accessed without authentication'
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'System settings cannot be deleted'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'settings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['companyId', 'key']
      },
      {
        fields: ['companyId']
      },
      {
        fields: ['category']
      },
      {
        fields: ['isPublic']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  // Class method to create default settings for a company
  Setting.createDefaultSettings = async function(companyId) {
    const defaultSettings = [
      // Company Settings
      {
        key: 'company.timezone',
        value: 'America/Phoenix',
        type: 'string',
        category: 'company',
        description: 'Company timezone',
        isSystem: true
      },
      {
        key: 'company.dateFormat',
        value: 'MM/DD/YYYY',
        type: 'string',
        category: 'company',
        description: 'Default date format',
        isSystem: true
      },
      {
        key: 'company.currency',
        value: 'USD',
        type: 'string',
        category: 'company',
        description: 'Default currency',
        isSystem: true
      },
      {
        key: 'company.taxRate',
        value: 0,
        type: 'number',
        category: 'company',
        description: 'Default tax rate percentage',
        isSystem: true
      },
      
      // Email Settings
      {
        key: 'email.smtp.enabled',
        value: false,
        type: 'boolean',
        category: 'email',
        description: 'Enable SMTP email sending'
      },
      {
        key: 'email.fromName',
        value: 'CRM System',
        type: 'string',
        category: 'email',
        description: 'Default from name for emails'
      },
      
      // Estimate Settings
      {
        key: 'estimates.defaultMarkup',
        value: 20,
        type: 'number',
        category: 'estimates',
        description: 'Default markup percentage for estimates'
      },
      {
        key: 'estimates.requireApproval',
        value: false,
        type: 'boolean',
        category: 'estimates',
        description: 'Require approval before sending estimates'
      },
      {
        key: 'estimates.autoExpire',
        value: 30,
        type: 'number',
        category: 'estimates',
        description: 'Days after which estimates automatically expire'
      },
      {
        key: 'estimates.terms',
        value: 'This estimate is valid for 30 days from the date issued.',
        type: 'string',
        category: 'estimates',
        description: 'Default terms and conditions for estimates'
      },
      
      // Invoice Settings
      {
        key: 'invoices.paymentTerms',
        value: 'Net 30',
        type: 'string',
        category: 'invoices',
        description: 'Default payment terms for invoices'
      },
      {
        key: 'invoices.autoSendReminders',
        value: true,
        type: 'boolean',
        category: 'invoices',
        description: 'Automatically send payment reminders'
      },
      {
        key: 'invoices.reminderDays',
        value: [7, 14, 30],
        type: 'array',
        category: 'invoices',
        description: 'Days before/after due date to send reminders'
      },
      
      // Notification Settings
      {
        key: 'notifications.email.enabled',
        value: true,
        type: 'boolean',
        category: 'notifications',
        description: 'Enable email notifications'
      },
      {
        key: 'notifications.sms.enabled',
        value: false,
        type: 'boolean',
        category: 'notifications',
        description: 'Enable SMS notifications'
      },
      
      // File Settings
      {
        key: 'files.maxUploadSize',
        value: 10485760, // 10MB in bytes
        type: 'number',
        category: 'files',
        description: 'Maximum file upload size in bytes'
      },
      {
        key: 'files.allowedTypes',
        value: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx', 'xls', 'xlsx'],
        type: 'array',
        category: 'files',
        description: 'Allowed file types for upload'
      }
    ];

    for (const settingData of defaultSettings) {
      await Setting.findOrCreate({
        where: { 
          companyId, 
          key: settingData.key 
        },
        defaults: {
          ...settingData,
          companyId
        }
      });
    }
  };

  // Instance method to get typed value
  Setting.prototype.getValue = function() {
    if (this.value === null || this.value === undefined) {
      return null;
    }

    switch (this.type) {
      case 'number':
        return typeof this.value === 'number' ? this.value : parseFloat(this.value);
      case 'boolean':
        return typeof this.value === 'boolean' ? this.value : this.value === 'true';
      case 'object':
      case 'array':
        return typeof this.value === 'object' ? this.value : JSON.parse(this.value);
      default:
        return this.value;
    }
  };

  // Class method to get setting by key
  Setting.getByKey = async function(companyId, key, defaultValue = null) {
    const setting = await Setting.findOne({
      where: { companyId, key, isActive: true }
    });
    
    return setting ? setting.getValue() : defaultValue;
  };

  // Class method to set setting by key
  Setting.setByKey = async function(companyId, key, value, type = 'string', category = 'general') {
    const [setting, created] = await Setting.findOrCreate({
      where: { companyId, key },
      defaults: {
        companyId,
        key,
        value,
        type,
        category
      }
    });

    if (!created) {
      setting.value = value;
      setting.type = type;
      await setting.save();
    }

    return setting;
  };

  return Setting;
};
