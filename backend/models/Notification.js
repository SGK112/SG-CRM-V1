module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('system', 'reminder', 'task', 'estimate', 'invoice', 'payment', 'project', 'file', 'message', 'custom'),
      defaultValue: 'system'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional data for the notification (entity IDs, URLs, etc.)'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    channel: {
      type: DataTypes.ENUM('in_app', 'email', 'sms', 'push', 'webhook'),
      defaultValue: 'in_app'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['isRead']
      },
      {
        fields: ['isArchived']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['sentAt']
      }
    ]
  });

  // Instance methods
  Notification.prototype.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  };

  Notification.prototype.archive = async function() {
    this.isArchived = true;
    this.archivedAt = new Date();
    await this.save();
  };

  Notification.prototype.unarchive = async function() {
    this.isArchived = false;
    this.archivedAt = null;
    await this.save();
  };

  // Class methods
  Notification.getUnreadForUser = async function(userId, limit = 20) {
    return await Notification.findAll({
      where: {
        userId,
        isRead: false,
        isArchived: false
      },
      order: [['sentAt', 'DESC']],
      limit
    });
  };

  Notification.getRecentForUser = async function(userId, limit = 20) {
    return await Notification.findAll({
      where: {
        userId,
        isArchived: false
      },
      order: [['sentAt', 'DESC']],
      limit
    });
  };

  Notification.getByTypeForUser = async function(userId, type, limit = 20) {
    return await Notification.findAll({
      where: {
        userId,
        type,
        isArchived: false
      },
      order: [['sentAt', 'DESC']],
      limit
    });
  };

  return Notification;
};
