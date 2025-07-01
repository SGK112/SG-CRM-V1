module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    estimateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Estimates',
        key: 'id'
      }
    },
    invoiceNumber: {
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
      type: DataTypes.ENUM('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'draft'
    },
    
    // Dates
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Financial
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
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
    total: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    amountPaid: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    amountDue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    
    // Terms
    paymentTerms: {
      type: DataTypes.STRING,
      defaultValue: 'Net 30'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    terms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Line items (simplified - could be separate table)
    lineItems: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of invoice line items'
    },
    
    // Payment information
    paymentMethods: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['check', 'cash'],
      comment: 'Accepted payment methods'
    },
    lateFee: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0
    },
    lateFeeDays: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    
    // Recurring invoice settings
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurringInterval: {
      type: DataTypes.ENUM('weekly', 'biweekly', 'monthly', 'quarterly', 'annually'),
      allowNull: true
    },
    recurringEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    parentInvoiceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Invoices',
        key: 'id'
      }
    },
    
    // Document
    pdfUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'invoices',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['invoiceNumber']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['projectId']
      },
      {
        fields: ['estimateId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['dueDate']
      },
      {
        fields: ['issueDate']
      },
      {
        fields: ['isRecurring']
      }
    ],
    hooks: {
      beforeCreate: async (invoice) => {
        if (!invoice.invoiceNumber) {
          // Generate invoice number
          const year = new Date().getFullYear();
          const count = await Invoice.count({
            where: {
              createdAt: {
                [sequelize.Sequelize.Op.gte]: new Date(year, 0, 1),
                [sequelize.Sequelize.Op.lt]: new Date(year + 1, 0, 1)
              }
            }
          });
          invoice.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
        }
      },
      beforeSave: (invoice) => {
        // Calculate totals
        if (invoice.changed('subtotal') || invoice.changed('taxRate') || invoice.changed('discount')) {
          const subtotal = parseFloat(invoice.subtotal) || 0;
          const taxRate = parseFloat(invoice.taxRate) || 0;
          const discount = parseFloat(invoice.discount) || 0;
          
          let discountAmount = discount;
          if (invoice.discountType === 'percentage') {
            discountAmount = subtotal * (discount / 100);
          }
          
          const discountedSubtotal = subtotal - discountAmount;
          invoice.taxAmount = discountedSubtotal * taxRate;
          invoice.total = discountedSubtotal + invoice.taxAmount;
        }
        
        // Calculate amount due
        if (invoice.changed('total') || invoice.changed('amountPaid')) {
          invoice.amountDue = (parseFloat(invoice.total) || 0) - (parseFloat(invoice.amountPaid) || 0);
        }
        
        // Update status based on payments
        if (invoice.changed('amountPaid')) {
          const total = parseFloat(invoice.total) || 0;
          const paid = parseFloat(invoice.amountPaid) || 0;
          
          if (paid === 0) {
            if (invoice.status === 'paid' || invoice.status === 'partial') {
              invoice.status = 'sent';
            }
          } else if (paid >= total) {
            invoice.status = 'paid';
            if (!invoice.paidAt) {
              invoice.paidAt = new Date();
            }
          } else {
            invoice.status = 'partial';
          }
        }
      }
    }
  });

  // Instance methods
  Invoice.prototype.calculateTotals = function() {
    const items = this.lineItems || [];
    
    this.subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.total) || 0);
    }, 0);

    const taxRate = parseFloat(this.taxRate) || 0;
    const discount = parseFloat(this.discount) || 0;
    
    let discountAmount = discount;
    if (this.discountType === 'percentage') {
      discountAmount = this.subtotal * (discount / 100);
    }
    
    const discountedSubtotal = this.subtotal - discountAmount;
    this.taxAmount = discountedSubtotal * taxRate;
    this.total = discountedSubtotal + this.taxAmount;
    this.amountDue = this.total - (parseFloat(this.amountPaid) || 0);
    
    return this;
  };

  Invoice.prototype.addLineItem = function(item) {
    const lineItems = [...(this.lineItems || [])];
    lineItems.push({
      id: Date.now().toString(),
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0),
      ...item
    });
    
    this.lineItems = lineItems;
    this.calculateTotals();
  };

  Invoice.prototype.removeLineItem = function(itemId) {
    this.lineItems = (this.lineItems || []).filter(item => item.id !== itemId);
    this.calculateTotals();
  };

  Invoice.prototype.markAsSent = async function() {
    this.status = 'sent';
    this.sentAt = new Date();
    await this.save();
  };

  Invoice.prototype.recordPayment = async function(amount, paymentMethod = 'check', reference = null) {
    const { Payment } = require('./index');
    
    const payment = await Payment.create({
      invoiceId: this.id,
      customerId: this.customerId,
      amount: amount,
      method: paymentMethod,
      reference: reference,
      status: 'completed'
    });

    // Update invoice amount paid
    this.amountPaid = (parseFloat(this.amountPaid) || 0) + parseFloat(amount);
    await this.save();

    return payment;
  };

  Invoice.prototype.isOverdue = function() {
    if (this.status === 'paid' || this.status === 'cancelled') return false;
    return new Date() > new Date(this.dueDate);
  };

  Invoice.prototype.getDaysOverdue = function() {
    if (!this.isOverdue()) return 0;
    
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = today - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  Invoice.prototype.applyLateFee = async function() {
    if (!this.isOverdue() || this.lateFee <= 0) return false;
    
    const daysOverdue = this.getDaysOverdue();
    if (daysOverdue < this.lateFeeDays) return false;
    
    // Check if late fee already applied
    const lateFeeItem = this.lineItems.find(item => item.isLateFee);
    if (lateFeeItem) return false;
    
    this.addLineItem({
      description: `Late Fee (${daysOverdue} days overdue)`,
      quantity: 1,
      unitPrice: this.lateFee,
      isLateFee: true
    });
    
    await this.save();
    return true;
  };

  Invoice.prototype.createRecurringInvoice = async function() {
    if (!this.isRecurring || !this.recurringInterval) return null;
    
    const newDueDate = new Date(this.dueDate);
    const newIssueDate = new Date();
    
    // Calculate next due date based on interval
    switch (this.recurringInterval) {
      case 'weekly':
        newDueDate.setDate(newDueDate.getDate() + 7);
        break;
      case 'biweekly':
        newDueDate.setDate(newDueDate.getDate() + 14);
        break;
      case 'monthly':
        newDueDate.setMonth(newDueDate.getMonth() + 1);
        break;
      case 'quarterly':
        newDueDate.setMonth(newDueDate.getMonth() + 3);
        break;
      case 'annually':
        newDueDate.setFullYear(newDueDate.getFullYear() + 1);
        break;
    }
    
    // Check if we've passed the end date
    if (this.recurringEndDate && newDueDate > new Date(this.recurringEndDate)) {
      return null;
    }
    
    const invoiceData = this.toJSON();
    delete invoiceData.id;
    delete invoiceData.invoiceNumber;
    delete invoiceData.createdAt;
    delete invoiceData.updatedAt;
    delete invoiceData.sentAt;
    delete invoiceData.paidAt;
    delete invoiceData.amountPaid;
    
    const newInvoice = await Invoice.create({
      ...invoiceData,
      issueDate: newIssueDate,
      dueDate: newDueDate,
      status: 'draft',
      amountDue: invoiceData.total,
      parentInvoiceId: this.id
    });
    
    return newInvoice;
  };

  // Class methods
  Invoice.findOverdue = async function(companyId) {
    const { Op } = require('sequelize');
    
    return await Invoice.findAll({
      where: {
        dueDate: {
          [Op.lt]: new Date()
        },
        status: {
          [Op.in]: ['sent', 'viewed', 'partial']
        }
      },
      include: [{
        model: sequelize.models.Customer,
        where: { companyId }
      }],
      order: [['dueDate', 'ASC']]
    });
  };

  return Invoice;
};
