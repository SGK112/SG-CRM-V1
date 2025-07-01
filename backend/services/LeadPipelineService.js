// Lead Pipeline Service
// Automates lead-to-customer workflow

class LeadPipelineService {
  constructor(emailService, smsService) {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  // Capture new lead and start automation
  async captureNewLead(leadData) {
    const lead = await this.createLead({
      ...leadData,
      status: 'new',
      score: this.calculateLeadScore(leadData),
      source: leadData.source || 'website',
      createdAt: new Date()
    });

    // Immediate actions
    await this.sendWelcomeEmail(lead);
    await this.notifyTeam(lead);
    await this.scheduleFollowUp(lead);

    return lead;
  }

  // Lead scoring algorithm
  calculateLeadScore(leadData) {
    let score = 0;
    
    // Project value
    if (leadData.estimatedBudget > 20000) score += 30;
    else if (leadData.estimatedBudget > 10000) score += 20;
    else if (leadData.estimatedBudget > 5000) score += 10;

    // Timeline urgency
    if (leadData.timeline === 'immediate') score += 25;
    else if (leadData.timeline === '1-3_months') score += 15;
    else if (leadData.timeline === '3-6_months') score += 10;

    // Location (local gets higher score)
    if (leadData.isLocal) score += 15;

    // Contact completeness
    if (leadData.email && leadData.phone) score += 10;
    
    // Referral source
    if (leadData.source === 'referral') score += 20;
    else if (leadData.source === 'repeat_customer') score += 25;

    return Math.min(score, 100); // Cap at 100
  }

  // Automated email sequences
  async startEmailSequence(lead) {
    const sequences = {
      new_lead: [
        { delay: 0, template: 'welcome_immediate' },
        { delay: 24, template: 'portfolio_showcase' },
        { delay: 72, template: 'free_consultation' },
        { delay: 168, template: 'special_offer' } // 1 week
      ],
      high_value: [
        { delay: 0, template: 'vip_welcome' },
        { delay: 12, template: 'priority_scheduling' },
        { delay: 48, template: 'custom_design_offer' }
      ]
    };

    const sequenceType = lead.score > 70 ? 'high_value' : 'new_lead';
    const sequence = sequences[sequenceType];

    for (const step of sequence) {
      await this.scheduleEmail(lead, step.template, step.delay);
    }
  }

  // Move lead through pipeline stages
  async updateLeadStage(leadId, newStage) {
    const stages = [
      'new',
      'contacted',
      'qualified',
      'estimate_sent',
      'estimate_approved',
      'contract_signed',
      'project_scheduled',
      'in_progress',
      'completed',
      'closed'
    ];

    const lead = await this.getLead(leadId);
    lead.status = newStage;
    lead.stageHistory.push({
      stage: newStage,
      timestamp: new Date(),
      duration: this.calculateStageDuration(lead)
    });

    // Trigger stage-specific actions
    switch (newStage) {
      case 'qualified':
        await this.scheduleEstimateCall(lead);
        break;
      case 'estimate_sent':
        await this.scheduleEstimateFollowUp(lead);
        break;
      case 'contract_signed':
        await this.createProjectSchedule(lead);
        await this.notifyProductionTeam(lead);
        break;
      case 'completed':
        await this.requestReview(lead);
        await this.sendMaintenanceReminder(lead, 365); // 1 year
        break;
    }

    return await this.updateLead(leadId, lead);
  }

  // Automated appointment scheduling
  async scheduleEstimateCall(lead) {
    const availableSlots = await this.getAvailableTimeSlots();
    
    // Send scheduling link to customer
    await this.emailService.send({
      to: lead.email,
      template: 'schedule_estimate',
      data: {
        customerName: lead.name,
        availableSlots: availableSlots,
        schedulingLink: `${process.env.FRONTEND_URL}/schedule/${lead.id}`
      }
    });

    // SMS reminder
    if (lead.phone) {
      await this.smsService.send({
        to: lead.phone,
        message: `Hi ${lead.name}! Ready to schedule your free countertop estimate? Book here: ${process.env.FRONTEND_URL}/schedule/${lead.id}`
      });
    }
  }

  // Customer retention automation
  async startRetentionSequence(customerId) {
    const customer = await this.getCustomer(customerId);
    
    // 6-month check-in
    await this.scheduleEmail(customer, 'satisfaction_checkin', 180);
    
    // 1-year maintenance reminder
    await this.scheduleEmail(customer, 'maintenance_reminder', 365);
    
    // 2-year upgrade opportunity
    await this.scheduleEmail(customer, 'upgrade_opportunity', 730);
    
    // Referral request
    await this.scheduleEmail(customer, 'referral_request', 60);
  }

  // Smart lead routing
  async routeLead(lead) {
    const salesReps = await this.getAvailableSalesReps();
    
    // Route based on lead score and rep capacity
    const bestRep = salesReps
      .filter(rep => rep.maxLeads > rep.currentLeads)
      .sort((a, b) => {
        // Prioritize by lead score match and availability
        const scoreA = this.calculateRepLeadMatch(a, lead);
        const scoreB = this.calculateRepLeadMatch(b, lead);
        return scoreB - scoreA;
      })[0];

    if (bestRep) {
      await this.assignLeadToRep(lead.id, bestRep.id);
      await this.notifyRep(bestRep, lead);
    }

    return bestRep;
  }
}

export default LeadPipelineService;
