module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    
    // Related entities (at least one should be present)
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Customers',
        key: 'id'
      }
    },
    estimateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Estimates',
        key: 'id'
      }
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Tasks',
        key: 'id'
      }
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Invoices',
        key: 'id'
      }
    },
    
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('general', 'meeting', 'phone_call', 'email', 'follow_up', 'issue', 'solution', 'warning', 'reminder'),
      defaultValue: 'general'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    
    // Categorization
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Custom category for organization'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    
    // Visibility and access
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Private notes only visible to creator'
    },
    visibleToCustomer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether customer can see this note'
    },
    
    // Communication tracking
    contactMethod: {
      type: DataTypes.ENUM('in_person', 'phone', 'email', 'text', 'video_call', 'other'),
      allowNull: true
    },
    contactWith: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Person or entity contacted'
    },
    
    // Follow-up and reminders
    requiresFollowUp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    followUpCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    
    // Attachments
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of file references'
    },
    
    // Pinning and importance
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    
    // Editing and history
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    editHistory: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'History of edits for audit trail'
    },
    
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'notes',
    timestamps: true,
    indexes: [
      {
        fields: ['createdBy']
      },
      {
        fields: ['projectId']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['estimateId']
      },
      {
        fields: ['taskId']
      },
      {
        fields: ['invoiceId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['category']
      },
      {
        fields: ['requiresFollowUp']
      },
      {
        fields: ['followUpDate']
      },
      {
        fields: ['isPinned']
      },
      {
        fields: ['isArchived']
      },
      {
        fields: ['visibleToCustomer']
      }
    ],
    hooks: {
      beforeUpdate: (note) => {
        // Track edit history
        if (note.changed('content')) {
          const editHistory = [...(note.editHistory || [])];
          editHistory.unshift({
            editedAt: new Date(),
            previousContent: note._previousDataValues.content,
            editedBy: note.createdBy // Could be enhanced to track who made the edit
          });
          
          // Keep only last 10 edits
          note.editHistory = editHistory.slice(0, 10);
          note.editedAt = new Date();
        }
      }
    }
  });

  // Instance methods
  Note.prototype.addAttachment = function(fileId, fileName, fileType) {
    const attachments = [...(this.attachments || [])];
    attachments.push({
      id: Date.now().toString(),
      fileId,
      fileName,
      fileType,
      attachedAt: new Date()
    });
    
    this.attachments = attachments;
  };

  Note.prototype.removeAttachment = function(attachmentId) {
    this.attachments = (this.attachments || []).filter(att => att.id !== attachmentId);
  };

  Note.prototype.pin = async function() {
    this.isPinned = true;
    await this.save();
  };

  Note.prototype.unpin = async function() {
    this.isPinned = false;
    await this.save();
  };

  Note.prototype.archive = async function() {
    this.isArchived = true;
    await this.save();
  };

  Note.prototype.unarchive = async function() {
    this.isArchived = false;
    await this.save();
  };

  Note.prototype.markFollowUpCompleted = async function() {
    this.followUpCompleted = true;
    await this.save();
  };

  Note.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      await this.save();
    }
  };

  Note.prototype.removeTag = async function(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    await this.save();
  };

  Note.prototype.canBeViewedBy = function(user) {
    // Private notes can only be viewed by creator
    if (this.isPrivate && this.createdBy !== user.id) {
      return false;
    }
    
    // Check if user has access to the related entity
    // This would need to be enhanced based on your access control logic
    return true;
  };

  Note.prototype.getRelatedEntity = function() {
    if (this.projectId) return { type: 'project', id: this.projectId };
    if (this.customerId) return { type: 'customer', id: this.customerId };
    if (this.estimateId) return { type: 'estimate', id: this.estimateId };
    if (this.taskId) return { type: 'task', id: this.taskId };
    if (this.invoiceId) return { type: 'invoice', id: this.invoiceId };
    return null;
  };

  // Class methods
  Note.getNotesForEntity = async function(entityType, entityId, options = {}) {
    const whereClause = {
      [`${entityType}Id`]: entityId,
      isArchived: false
    };
    
    if (options.visibleToCustomer !== undefined) {
      whereClause.visibleToCustomer = options.visibleToCustomer;
    }
    
    if (options.userId && options.includePrivate === false) {
      whereClause[sequelize.Sequelize.Op.or] = [
        { isPrivate: false },
        { createdBy: options.userId }
      ];
    }
    
    return await Note.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
  };

  Note.getFollowUpNotes = async function(companyId, userId = null) {
    const { Op } = require('sequelize');
    
    const whereClause = {
      requiresFollowUp: true,
      followUpCompleted: false,
      isArchived: false,
      followUpDate: {
        [Op.lte]: new Date()
      }
    };
    
    if (userId) {
      whereClause.createdBy = userId;
    }
    
    return await Note.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['followUpDate', 'ASC']]
    });
  };

  Note.searchNotes = async function(companyId, searchTerm, options = {}) {
    const { Op } = require('sequelize');
    
    const whereClause = {
      isArchived: false,
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { content: { [Op.iLike]: `%${searchTerm}%` } },
        { tags: { [Op.contains]: [searchTerm] } }
      ]
    };
    
    if (options.userId && options.includePrivate === false) {
      whereClause[Op.and] = [
        {
          [Op.or]: [
            { isPrivate: false },
            { createdBy: options.userId }
          ]
        }
      ];
    }
    
    return await Note.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [
        ['isPinned', 'DESC'],
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
  };

  Note.getRecentNotes = async function(companyId, userId = null, limit = 10) {
    const whereClause = {
      isArchived: false
    };
    
    if (userId) {
      whereClause.createdBy = userId;
    }
    
    return await Note.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit
    });
  };

  return Note;
};
