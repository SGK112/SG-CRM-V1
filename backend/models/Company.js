module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Contains street, city, state, zipCode, country'
    },
    businessInfo: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Contains license, insurance, certifications, etc.'
    },
    branding: {
      type: DataTypes.JSONB,
      defaultValue: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#F59E0B',
        logoUrl: null,
        faviconUrl: null,
        customCss: null
      }
    },
    subscription: {
      type: DataTypes.JSONB,
      defaultValue: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: null,
        features: []
      }
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        timezone: 'America/Phoenix',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        taxRate: 0,
        defaultMarkup: 20,
        estimateTerms: '',
        invoiceTerms: '',
        autoSendReminders: true,
        requireApproval: false
      }
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
    tableName: 'companies',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['name']
      },
      {
        fields: ['isActive']
      }
    ],
    hooks: {
      beforeCreate: (company) => {
        if (!company.slug) {
          company.slug = company.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
      },
      beforeUpdate: (company) => {
        if (company.changed('name') && !company.changed('slug')) {
          company.slug = company.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
      }
    }
  });

  Company.prototype.getFullAddress = function() {
    const addr = this.address;
    if (!addr.street) return '';
    return `${addr.street}${addr.city ? ', ' + addr.city : ''}${addr.state ? ', ' + addr.state : ''} ${addr.zipCode || ''}`.trim();
  };

  Company.prototype.updateSettings = async function(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await this.save();
    return this.settings;
  };

  Company.prototype.updateBranding = async function(newBranding) {
    this.branding = { ...this.branding, ...newBranding };
    await this.save();
    return this.branding;
  };

  return Company;
};
