module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Invoices',
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
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'other'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
      defaultValue: 'pending'
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Check number, transaction ID, etc.'
    },
    
    // Payment processing details
    processorId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ID from payment processor (Stripe, PayPal, etc.)'
    },
    processorResponse: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Full response from payment processor'
    },
    
    // Dates
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Fee information
    processingFee: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
      comment: 'Fee charged by payment processor'
    },
    netAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Amount received after fees'
    },
    
    // Additional details
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    receiptUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    // Refund information
    isRefund: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    originalPaymentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Payments',
        key: 'id'
      }
    },
    refundReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
      {
        fields: ['invoiceId']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['method']
      },
      {
        fields: ['status']
      },
      {
        fields: ['paymentDate']
      },
      {
        fields: ['processorId']
      },
      {
        fields: ['reference']
      },
      {
        fields: ['originalPaymentId']
      }
    ],
    hooks: {
      beforeSave: (payment) => {
        // Calculate net amount if not set
        if (!payment.netAmount) {
          payment.netAmount = (parseFloat(payment.amount) || 0) - (parseFloat(payment.processingFee) || 0);
        }
      },
      afterSave: async (payment) => {
        // Update invoice amount paid when payment status changes
        if (payment.changed('status') && payment.status === 'completed') {
          const { Invoice } = require('./index');
          const invoice = await Invoice.findByPk(payment.invoiceId);
          if (invoice) {
            const totalPayments = await Payment.sum('amount', {
              where: {
                invoiceId: payment.invoiceId,
                status: 'completed',
                isRefund: false
              }
            });
            
            const totalRefunds = await Payment.sum('amount', {
              where: {
                invoiceId: payment.invoiceId,
                status: 'completed',
                isRefund: true
              }
            });
            
            invoice.amountPaid = (totalPayments || 0) - (totalRefunds || 0);
            await invoice.save();
          }
        }
      }
    }
  });

  // Instance methods
  Payment.prototype.markAsCompleted = async function() {
    this.status = 'completed';
    this.processedAt = new Date();
    await this.save();
  };

  Payment.prototype.markAsFailed = async function(reason = null) {
    this.status = 'failed';
    this.processedAt = new Date();
    if (reason) {
      this.notes = this.notes ? `${this.notes}\n\nFailure reason: ${reason}` : `Failure reason: ${reason}`;
    }
    await this.save();
  };

  Payment.prototype.createRefund = async function(amount = null, reason = null) {
    if (this.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    const refundAmount = amount || this.amount;
    if (refundAmount > this.amount) {
      throw new Error('Refund amount cannot exceed original payment amount');
    }

    const refund = await Payment.create({
      invoiceId: this.invoiceId,
      customerId: this.customerId,
      amount: refundAmount,
      method: this.method,
      status: 'completed',
      isRefund: true,
      originalPaymentId: this.id,
      refundReason: reason,
      paymentDate: new Date(),
      processedAt: new Date()
    });

    return refund;
  };

  Payment.prototype.getReceiptData = function() {
    return {
      id: this.id,
      amount: this.amount,
      method: this.method,
      reference: this.reference,
      paymentDate: this.paymentDate,
      status: this.status,
      processingFee: this.processingFee,
      netAmount: this.netAmount
    };
  };

  // Class methods
  Payment.getTotalByMethod = async function(companyId, startDate = null, endDate = null) {
    const { Op } = require('sequelize');
    
    const whereClause = {
      status: 'completed',
      isRefund: false
    };

    if (startDate && endDate) {
      whereClause.paymentDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const payments = await Payment.findAll({
      where: whereClause,
      include: [{
        model: sequelize.models.Invoice,
        include: [{
          model: sequelize.models.Customer,
          where: { companyId },
          attributes: []
        }],
        attributes: []
      }],
      attributes: [
        'method',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('Payment.id')), 'count']
      ],
      group: ['method'],
      raw: true
    });

    return payments;
  };

  Payment.getMonthlyTotals = async function(companyId, year) {
    const { Op } = require('sequelize');
    
    const payments = await Payment.findAll({
      where: {
        status: 'completed',
        isRefund: false,
        paymentDate: {
          [Op.between]: [
            new Date(year, 0, 1),
            new Date(year + 1, 0, 1)
          ]
        }
      },
      include: [{
        model: sequelize.models.Invoice,
        include: [{
          model: sequelize.models.Customer,
          where: { companyId },
          attributes: []
        }],
        attributes: []
      }],
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "paymentDate"')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('Payment.id')), 'count']
      ],
      group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "paymentDate"'))],
      order: [[sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "paymentDate"')), 'ASC']],
      raw: true
    });

    // Fill in missing months with zero values
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: '0',
      count: '0'
    }));

    payments.forEach(payment => {
      const monthIndex = parseInt(payment.month) - 1;
      monthlyData[monthIndex] = payment;
    });

    return monthlyData;
  };

  Payment.getFailedPayments = async function(companyId, days = 30) {
    const { Op } = require('sequelize');
    
    return await Payment.findAll({
      where: {
        status: 'failed',
        createdAt: {
          [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      include: [{
        model: sequelize.models.Invoice,
        include: [{
          model: sequelize.models.Customer,
          where: { companyId }
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
  };

  return Payment;
};
