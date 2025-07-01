module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    parentTaskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Tasks',
        key: 'id'
      },
      comment: 'For subtasks'
    },
    
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'review', 'blocked', 'completed', 'cancelled'),
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Task type (installation, inspection, cleanup, etc.)'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Task category (preparation, execution, follow-up, etc.)'
    },
    
    // Scheduling
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 0
    },
    actualHours: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 0
    },
    
    // Progress tracking
    percentComplete: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    
    // Location and resources
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Specific location within the job site'
    },
    requiredTools: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    requiredMaterials: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Materials needed with quantities'
    },
    skillsRequired: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    
    // Dependencies
    dependencies: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      comment: 'Task IDs that must be completed before this task'
    },
    blockedBy: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'What is blocking this task'
    },
    
    // Completion tracking
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    completionNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Quality control
    requiresInspection: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    inspectionStatus: {
      type: DataTypes.ENUM('pending', 'passed', 'failed', 'not_required'),
      defaultValue: 'not_required'
    },
    inspectedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    inspectionNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Organization
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    
    // Time tracking
    timeEntries: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of time tracking entries'
    },
    
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    indexes: [
      {
        fields: ['projectId']
      },
      {
        fields: ['assignedTo']
      },
      {
        fields: ['createdBy']
      },
      {
        fields: ['parentTaskId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['dueDate']
      },
      {
        fields: ['startDate']
      },
      {
        fields: ['projectId', 'sortOrder']
      }
    ],
    hooks: {
      beforeSave: (task) => {
        // Auto-update completion status
        if (task.changed('percentComplete')) {
          if (task.percentComplete === 100 && task.status !== 'completed') {
            task.status = 'completed';
            task.completedAt = new Date();
          } else if (task.percentComplete < 100 && task.status === 'completed') {
            task.status = 'in_progress';
            task.completedAt = null;
          }
        }
        
        // Auto-update status when marked as completed
        if (task.changed('status')) {
          if (task.status === 'completed') {
            task.percentComplete = 100;
            if (!task.completedAt) {
              task.completedAt = new Date();
            }
          } else if (task.status !== 'completed') {
            task.completedAt = null;
          }
        }
      },
      afterSave: async (task) => {
        // Update project progress when task progress changes
        if (task.changed('percentComplete') || task.changed('status')) {
          const { Project } = require('./index');
          const project = await Project.findByPk(task.projectId);
          if (project) {
            await project.calculateProgress();
          }
        }
      }
    }
  });

  // Instance methods
  Task.prototype.markAsCompleted = async function(completedBy = null, notes = null) {
    this.status = 'completed';
    this.percentComplete = 100;
    this.completedAt = new Date();
    this.completedBy = completedBy;
    if (notes) {
      this.completionNotes = notes;
    }
    await this.save();
  };

  Task.prototype.startTask = async function() {
    this.status = 'in_progress';
    if (!this.startDate) {
      this.startDate = new Date();
    }
    await this.save();
  };

  Task.prototype.addTimeEntry = function(entry) {
    const timeEntries = [...(this.timeEntries || [])];
    timeEntries.push({
      id: Date.now().toString(),
      userId: entry.userId,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: entry.duration,
      description: entry.description || '',
      createdAt: new Date()
    });
    
    this.timeEntries = timeEntries;
    
    // Update actual hours
    this.actualHours = timeEntries.reduce((total, entry) => {
      return total + (parseFloat(entry.duration) || 0);
    }, 0);
  };

  Task.prototype.getTotalTimeSpent = function() {
    return (this.timeEntries || []).reduce((total, entry) => {
      return total + (parseFloat(entry.duration) || 0);
    }, 0);
  };

  Task.prototype.isOverdue = function() {
    if (!this.dueDate || this.status === 'completed') return false;
    return new Date() > new Date(this.dueDate);
  };

  Task.prototype.getDaysUntilDue = function() {
    if (!this.dueDate || this.status === 'completed') return null;
    
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  Task.prototype.canStart = async function() {
    if (this.dependencies.length === 0) return true;
    
    const dependentTasks = await Task.findAll({
      where: {
        id: this.dependencies
      }
    });
    
    return dependentTasks.every(task => task.status === 'completed');
  };

  Task.prototype.getSubtasks = async function() {
    return await Task.findAll({
      where: {
        parentTaskId: this.id
      },
      order: [['sortOrder', 'ASC']]
    });
  };

  Task.prototype.passInspection = async function(inspectedBy, notes = null) {
    this.inspectionStatus = 'passed';
    this.inspectedBy = inspectedBy;
    this.inspectionNotes = notes;
    await this.save();
  };

  Task.prototype.failInspection = async function(inspectedBy, notes) {
    this.inspectionStatus = 'failed';
    this.inspectedBy = inspectedBy;
    this.inspectionNotes = notes;
    this.status = 'blocked';
    await this.save();
  };

  // Class methods
  Task.getTasksByStatus = async function(projectId, status = null) {
    const whereClause = { projectId };
    if (status) {
      whereClause.status = status;
    }
    
    return await Task.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });
  };

  Task.getOverdueTasks = async function(companyId) {
    const { Op } = require('sequelize');
    
    return await Task.findAll({
      where: {
        dueDate: {
          [Op.lt]: new Date()
        },
        status: {
          [Op.notIn]: ['completed', 'cancelled']
        }
      },
      include: [{
        model: sequelize.models.Project,
        where: { companyId },
        include: [{
          model: sequelize.models.Customer
        }]
      }, {
        model: sequelize.models.User,
        as: 'assignee'
      }],
      order: [['dueDate', 'ASC']]
    });
  };

  Task.getTasksForUser = async function(userId, status = null) {
    const whereClause = { assignedTo: userId };
    if (status) {
      whereClause.status = status;
    }
    
    return await Task.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.Project,
        include: [{
          model: sequelize.models.Customer
        }]
      }],
      order: [['dueDate', 'ASC'], ['priority', 'DESC']]
    });
  };

  return Task;
};
