module.exports = (sequelize, DataTypes) => {
  const Estimate = sequelize.define('Estimate', {
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
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Projects',
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
    estimateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
      type: DataTypes.ENUM('draft', 'pending_approval', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'),
      defaultValue: 'draft'
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    jobLocation: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Job site address information'
    },
    
    // Pricing breakdown
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Sum of all line items before taxes and adjustments'
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0,
      comment: 'Tax rate as decimal (e.g., 0.0875 for 8.75%)'
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    discountType: {
      type: DataTypes.ENUM('amount', 'percentage'),
      defaultValue: 'amount'
    },
    adjustments: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of additional adjustments (fees, discounts, etc.)'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Final total amount'
    },

    // Terms and conditions
    terms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal notes not visible to customer'
    },

    // Tracking
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // E-signature
    requireSignature: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    signedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    signedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    signatureData: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Digital signature information'
    },

    // Document generation
    pdfUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Reference to estimate template used'
    },

    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'estimates',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['estimateNumber']
      },
      {
        fields: ['companyId']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['projectId']
      },
      {
        fields: ['createdBy']
      },
      {
        fields: ['status']
      },
      {
        fields: ['validUntil']
      },
      {
        fields: ['sentAt']
      }
    ],
    hooks: {
      beforeCreate: async (estimate) => {
        if (!estimate.estimateNumber) {
          // Generate estimate number
          const year = new Date().getFullYear();
          const count = await Estimate.count({
            where: {
              companyId: estimate.companyId,
              createdAt: {
                [sequelize.Sequelize.Op.gte]: new Date(year, 0, 1),
                [sequelize.Sequelize.Op.lt]: new Date(year + 1, 0, 1)
              }
            }
          });
          estimate.estimateNumber = `EST-${year}-${String(count + 1).padStart(4, '0')}`;
        }
      },
      beforeSave: (estimate) => {
        // Auto-calculate totals if not manually set
        if (estimate.changed('subtotal') || estimate.changed('taxRate') || estimate.changed('discount')) {
          const subtotal = parseFloat(estimate.subtotal) || 0;
          const taxRate = parseFloat(estimate.taxRate) || 0;
          const discount = parseFloat(estimate.discount) || 0;
          
          let discountAmount = discount;
          if (estimate.discountType === 'percentage') {
            discountAmount = subtotal * (discount / 100);
          }
          
          const discountedSubtotal = subtotal - discountAmount;
          estimate.taxAmount = discountedSubtotal * taxRate;
          estimate.total = discountedSubtotal + estimate.taxAmount;
        }
      }
    }
  });

  // Instance methods
  Estimate.prototype.calculateTotals = async function() {
    const { EstimateItem } = require('./index');
    
    const items = await EstimateItem.findAll({
      where: { estimateId: this.id }
    });

    this.subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.total) || 0);
    }, 0);

    // Recalculate taxes and total
    const taxRate = parseFloat(this.taxRate) || 0;
    const discount = parseFloat(this.discount) || 0;
    
    let discountAmount = discount;
    if (this.discountType === 'percentage') {
      discountAmount = this.subtotal * (discount / 100);
    }
    
    const discountedSubtotal = this.subtotal - discountAmount;
    this.taxAmount = discountedSubtotal * taxRate;
    this.total = discountedSubtotal + this.taxAmount;

    await this.save();
    return this;
  };

  Estimate.prototype.markAsSent = async function() {
    this.status = 'sent';
    this.sentAt = new Date();
    await this.save();
  };

  Estimate.prototype.markAsViewed = async function() {
    if (!this.viewedAt) {
      this.viewedAt = new Date();
      if (this.status === 'sent') {
        this.status = 'viewed';
      }
      await this.save();
    }
  };

  Estimate.prototype.markAsAccepted = async function(signatureData = null) {
    this.status = 'accepted';
    this.respondedAt = new Date();
    
    if (signatureData) {
      this.signedAt = new Date();
      this.signedBy = signatureData.signerName;
      this.signatureData = signatureData;
    }
    
    await this.save();
  };

  Estimate.prototype.markAsRejected = async function() {
    this.status = 'rejected';
    this.respondedAt = new Date();
    await this.save();
  };

  Estimate.prototype.convertToProject = async function() {
    const { Project } = require('./index');
    
    if (this.status !== 'accepted') {
      throw new Error('Only accepted estimates can be converted to projects');
    }

    const project = await Project.create({
      companyId: this.companyId,
      customerId: this.customerId,
      name: this.title,
      description: this.description,
      estimatedValue: this.total,
      status: 'planned',
      startDate: new Date(),
      metadata: {
        convertedFromEstimate: this.id
      }
    });

    this.projectId = project.id;
    this.status = 'converted';
    await this.save();

    return project;
  };

  Estimate.prototype.isExpired = function() {
    return this.validUntil && new Date() > new Date(this.validUntil);
  };

  Estimate.prototype.canBeEdited = function() {
    return ['draft', 'pending_approval'].includes(this.status);
  };

  Estimate.prototype.canBeSent = function() {
    return ['draft', 'pending_approval'].includes(this.status) && !this.isExpired();
  };

  return Estimate;
};
