module.exports = (sequelize, DataTypes) => {
  const Integration = sequelize.define('Integration', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Integration name (QuickBooks, Stripe, Google Calendar, etc.)'
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Provider slug (quickbooks, stripe, google, etc.)'
    },
    type: {
      type: DataTypes.ENUM('accounting', 'payment', 'calendar', 'communication', 'storage', 'other'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'error', 'pending'),
      defaultValue: 'inactive'
    },
    credentials: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Encrypted credentials JSON'
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Integration-specific settings'
    },
    lastSync: {
      type: DataTypes.DATE,
      allowNull: true
    },
    syncStatus: {
      type: DataTypes.ENUM('success', 'error', 'pending', 'never'),
      defaultValue: 'never'
    },
    syncLog: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of sync log entries'
    },
    webhookUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    webhookSecret: {
      type: DataTypes.STRING,
      allowNull: true
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
    tableName: 'integrations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['companyId', 'provider']
      },
      {
        fields: ['companyId']
      },
      {
        fields: ['provider']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      }
    ]
  });

  Integration.prototype.encryptCredentials = function(credentials) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production';
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, secretKey);
    
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  };

  Integration.prototype.decryptCredentials = function() {
    if (!this.credentials) return null;
    
    try {
      const crypto = require('crypto');
      const algorithm = 'aes-256-gcm';
      const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production';
      
      const credData = JSON.parse(this.credentials);
      const decipher = crypto.createDecipher(algorithm, secretKey);
      
      decipher.setAuthTag(Buffer.from(credData.authTag, 'hex'));
      
      let decrypted = decipher.update(credData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting credentials:', error);
      return null;
    }
  };

  Integration.prototype.updateSyncLog = function(entry) {
    const logs = this.syncLog || [];
    logs.unshift({
      timestamp: new Date(),
      ...entry
    });
    
    // Keep only last 50 entries
    this.syncLog = logs.slice(0, 50);
  };

  Integration.prototype.markSyncSuccess = async function(message = 'Sync completed successfully') {
    this.lastSync = new Date();
    this.syncStatus = 'success';
    this.updateSyncLog({ status: 'success', message });
    await this.save();
  };

  Integration.prototype.markSyncError = async function(error) {
    this.syncStatus = 'error';
    this.updateSyncLog({ 
      status: 'error', 
      message: error.message || error,
      details: error.stack || null
    });
    await this.save();
  };

  return Integration;
};
