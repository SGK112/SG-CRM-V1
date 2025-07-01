module.exports = (sequelize, DataTypes) => {
  const EstimateItem = sequelize.define('EstimateItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    estimateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Estimates',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM('material', 'labor', 'equipment', 'service', 'other'),
      defaultValue: 'material'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Item category (flooring, plumbing, electrical, etc.)'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Unit of measurement (sq ft, linear ft, each, hour, etc.)'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 1
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Cost per unit before markup'
    },
    markup: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Markup percentage'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Final price per unit after markup'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total line item amount (quantity * unitPrice)'
    },
    
    // Advanced calculations
    wasteFactor: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0,
      comment: 'Waste factor as decimal (e.g., 0.10 for 10% waste)'
    },
    laborHours: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
      comment: 'Estimated labor hours for this item'
    },
    laborRate: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
      comment: 'Labor rate per hour'
    },
    
    // Material specifications
    specifications: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Detailed specifications (brand, model, color, etc.)'
    },
    
    // Vendor information
    vendorSku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendorName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendorPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    
    // Options and add-ons
    isOptional: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAddOn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    parentItemId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'EstimateItems',
        key: 'id'
      },
      comment: 'For sub-items or add-ons'
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
    tableName: 'estimate_items',
    timestamps: true,
    indexes: [
      {
        fields: ['estimateId']
      },
      {
        fields: ['estimateId', 'sortOrder']
      },
      {
        fields: ['type']
      },
      {
        fields: ['category']
      },
      {
        fields: ['parentItemId']
      }
    ],
    hooks: {
      beforeSave: (item) => {
        // Auto-calculate unit price from cost and markup
        if (item.changed('unitCost') || item.changed('markup')) {
          const cost = parseFloat(item.unitCost) || 0;
          const markup = parseFloat(item.markup) || 0;
          item.unitPrice = cost * (1 + markup / 100);
        }
        
        // Auto-calculate total
        if (item.changed('quantity') || item.changed('unitPrice')) {
          const quantity = parseFloat(item.quantity) || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const wasteFactor = parseFloat(item.wasteFactor) || 0;
          
          // Apply waste factor to quantity for materials
          const adjustedQuantity = item.type === 'material' 
            ? quantity * (1 + wasteFactor)
            : quantity;
            
          item.total = adjustedQuantity * unitPrice;
        }
      },
      afterSave: async (item) => {
        // Update estimate totals when item changes
        const { Estimate } = require('./index');
        const estimate = await Estimate.findByPk(item.estimateId);
        if (estimate) {
          await estimate.calculateTotals();
        }
      },
      afterDestroy: async (item) => {
        // Update estimate totals when item is deleted
        const { Estimate } = require('./index');
        const estimate = await Estimate.findByPk(item.estimateId);
        if (estimate) {
          await estimate.calculateTotals();
        }
      }
    }
  });

  // Instance methods
  EstimateItem.prototype.calculateTotal = function() {
    const quantity = parseFloat(this.quantity) || 0;
    const unitPrice = parseFloat(this.unitPrice) || 0;
    const wasteFactor = parseFloat(this.wasteFactor) || 0;
    
    // Apply waste factor to quantity for materials
    const adjustedQuantity = this.type === 'material' 
      ? quantity * (1 + wasteFactor)
      : quantity;
      
    this.total = adjustedQuantity * unitPrice;
    return this.total;
  };

  EstimateItem.prototype.calculateUnitPrice = function() {
    const cost = parseFloat(this.unitCost) || 0;
    const markup = parseFloat(this.markup) || 0;
    this.unitPrice = cost * (1 + markup / 100);
    return this.unitPrice;
  };

  EstimateItem.prototype.getAdjustedQuantity = function() {
    const quantity = parseFloat(this.quantity) || 0;
    const wasteFactor = parseFloat(this.wasteFactor) || 0;
    
    return this.type === 'material' 
      ? quantity * (1 + wasteFactor)
      : quantity;
  };

  EstimateItem.prototype.getTotalLaborCost = function() {
    const hours = parseFloat(this.laborHours) || 0;
    const rate = parseFloat(this.laborRate) || 0;
    return hours * rate;
  };

  // Class method to duplicate items to another estimate
  EstimateItem.duplicateToEstimate = async function(sourceEstimateId, targetEstimateId) {
    const items = await EstimateItem.findAll({
      where: { estimateId: sourceEstimateId },
      order: [['sortOrder', 'ASC']]
    });

    const duplicatedItems = [];
    for (const item of items) {
      const itemData = item.toJSON();
      delete itemData.id;
      delete itemData.createdAt;
      delete itemData.updatedAt;
      itemData.estimateId = targetEstimateId;
      
      const newItem = await EstimateItem.create(itemData);
      duplicatedItems.push(newItem);
    }

    return duplicatedItems;
  };

  return EstimateItem;
};
