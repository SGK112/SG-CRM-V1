module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
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
    type: {
      type: DataTypes.ENUM('individual', 'business'),
      defaultValue: 'individual'
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    alternatePhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Contains street, city, state, zipCode, country'
    },
    billingAddress: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Separate billing address if different from main address'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'prospect', 'lead'),
      defaultValue: 'prospect'
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'How the customer was acquired (referral, website, advertising, etc.)'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        communicationMethod: 'email', // email, phone, text
        bestTimeToContact: 'morning', // morning, afternoon, evening
        emailOptIn: true,
        smsOptIn: false
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    creditLimit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    paymentTerms: {
      type: DataTypes.STRING,
      defaultValue: 'Net 30'
    },
    taxExempt: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referredBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Customers',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastContact: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'customers',
    timestamps: true,
    indexes: [
      {
        fields: ['companyId']
      },
      {
        fields: ['email']
      },
      {
        fields: ['phone']
      },
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['lastName', 'firstName']
      },
      {
        fields: ['businessName']
      }
    ]
  });

  Customer.prototype.getDisplayName = function() {
    if (this.type === 'business' && this.businessName) {
      return this.businessName;
    }
    
    const name = [this.firstName, this.lastName].filter(Boolean).join(' ');
    return name || this.email || 'Unnamed Customer';
  };

  Customer.prototype.getFullAddress = function() {
    const addr = this.address;
    if (!addr || !addr.street) return '';
    
    return `${addr.street}${addr.city ? ', ' + addr.city : ''}${addr.state ? ', ' + addr.state : ''} ${addr.zipCode || ''}`.trim();
  };

  Customer.prototype.getBillingAddress = function() {
    // Use billing address if set, otherwise fall back to main address
    const addr = Object.keys(this.billingAddress).length > 0 ? this.billingAddress : this.address;
    if (!addr || !addr.street) return '';
    
    return `${addr.street}${addr.city ? ', ' + addr.city : ''}${addr.state ? ', ' + addr.state : ''} ${addr.zipCode || ''}`.trim();
  };

  Customer.prototype.updateLastContact = async function() {
    this.lastContact = new Date();
    await this.save();
  };

  Customer.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      await this.save();
    }
  };

  Customer.prototype.removeTag = async function(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    await this.save();
  };

  // Calculate customer lifetime value
  Customer.prototype.getLifetimeValue = async function() {
    const { Invoice, Payment } = require('./index');
    
    const totalInvoiced = await Invoice.sum('total', {
      where: {
        customerId: this.id,
        status: ['sent', 'paid', 'partial']
      }
    });

    const totalPaid = await Payment.sum('amount', {
      include: [{
        model: Invoice,
        where: { customerId: this.id }
      }]
    });

    return {
      totalInvoiced: totalInvoiced || 0,
      totalPaid: totalPaid || 0,
      outstandingBalance: (totalInvoiced || 0) - (totalPaid || 0)
    };
  };

  return Customer;
};
