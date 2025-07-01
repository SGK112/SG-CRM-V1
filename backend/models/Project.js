module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
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
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Customers',
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
    projectNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('planned', 'active', 'on_hold', 'completed', 'cancelled'),
      defaultValue: 'planned'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Project type (installation, repair, maintenance, etc.)'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Project category (residential, commercial, etc.)'
    },
    
    // Location
    jobSite: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Job site address and details'
    },
    
    // Dates and timeline
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated duration in days'
    },
    actualStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Financial
    estimatedValue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    actualCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    budgetAllocated: {
      type: DataTypes.DECIMAL(12, 2),
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
    milestones: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of project milestones'
    },
    
    // Resources
    teamMembers: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      comment: 'Array of user IDs assigned to this project'
    },
    equipment: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Equipment and tools required'
    },
    materials: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Materials needed for the project'
    },
    
    // Communication
    clientContactInfo: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Primary client contact for this project'
    },
    emergencyContact: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Emergency contact information'
    },
    
    // Special requirements
    permits: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Required permits and their status'
    },
    inspections: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Required inspections and their status'
    },
    specialRequirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Internal tracking
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'projects',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['projectNumber']
      },
      {
        fields: ['companyId']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['assignedTo']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['startDate']
      },
      {
        fields: ['endDate']
      }
    ],
    hooks: {
      beforeCreate: async (project) => {
        if (!project.projectNumber) {
          // Generate project number
          const year = new Date().getFullYear();
          const count = await Project.count({
            where: {
              companyId: project.companyId,
              createdAt: {
                [sequelize.Sequelize.Op.gte]: new Date(year, 0, 1),
                [sequelize.Sequelize.Op.lt]: new Date(year + 1, 0, 1)
              }
            }
          });
          project.projectNumber = `PRJ-${year}-${String(count + 1).padStart(4, '0')}`;
        }
      }
    }
  });

  // Instance methods
  Project.prototype.updateProgress = async function(percentComplete) {
    this.percentComplete = Math.max(0, Math.min(100, percentComplete));
    
    // Auto-update status based on progress
    if (this.percentComplete === 0 && this.status === 'active') {
      // Keep active status
    } else if (this.percentComplete > 0 && this.percentComplete < 100 && this.status === 'planned') {
      this.status = 'active';
      if (!this.actualStartDate) {
        this.actualStartDate = new Date();
      }
    } else if (this.percentComplete === 100 && this.status !== 'completed') {
      this.status = 'completed';
      if (!this.actualEndDate) {
        this.actualEndDate = new Date();
      }
    }
    
    await this.save();
  };

  Project.prototype.addMilestone = async function(milestone) {
    const milestones = [...this.milestones];
    milestones.push({
      id: Date.now().toString(),
      name: milestone.name,
      description: milestone.description || '',
      dueDate: milestone.dueDate,
      completed: false,
      completedAt: null,
      createdAt: new Date()
    });
    
    this.milestones = milestones;
    await this.save();
  };

  Project.prototype.completeMilestone = async function(milestoneId) {
    const milestones = this.milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          completed: true,
          completedAt: new Date()
        };
      }
      return m;
    });
    
    this.milestones = milestones;
    await this.save();
  };

  Project.prototype.addTeamMember = async function(userId) {
    if (!this.teamMembers.includes(userId)) {
      this.teamMembers = [...this.teamMembers, userId];
      await this.save();
    }
  };

  Project.prototype.removeTeamMember = async function(userId) {
    this.teamMembers = this.teamMembers.filter(id => id !== userId);
    await this.save();
  };

  Project.prototype.getDuration = function() {
    if (this.actualStartDate && this.actualEndDate) {
      const start = new Date(this.actualStartDate);
      const end = new Date(this.actualEndDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    
    return null;
  };

  Project.prototype.isOverdue = function() {
    if (!this.endDate || this.status === 'completed') return false;
    return new Date() > new Date(this.endDate);
  };

  Project.prototype.getDaysRemaining = function() {
    if (!this.endDate || this.status === 'completed') return null;
    
    const today = new Date();
    const endDate = new Date(this.endDate);
    const diffTime = endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  Project.prototype.getFinancialSummary = async function() {
    const { Invoice, Payment, EstimateItem } = require('./index');
    
    // Get total invoiced amount
    const totalInvoiced = await Invoice.sum('total', {
      where: { projectId: this.id }
    });

    // Get total paid amount
    const totalPaid = await Payment.sum('amount', {
      include: [{
        model: Invoice,
        where: { projectId: this.id }
      }]
    });

    return {
      estimatedValue: parseFloat(this.estimatedValue) || 0,
      budgetAllocated: parseFloat(this.budgetAllocated) || 0,
      actualCost: parseFloat(this.actualCost) || 0,
      totalInvoiced: totalInvoiced || 0,
      totalPaid: totalPaid || 0,
      outstandingAmount: (totalInvoiced || 0) - (totalPaid || 0),
      profitMargin: ((totalPaid || 0) - (this.actualCost || 0)) / (totalPaid || 1) * 100
    };
  };

  return Project;
};
