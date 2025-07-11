// Advanced AI Service - Simple interface, incredibly powerful backend
class AIService {
  constructor() {
    this.conversationHistory = [];
    this.userContext = {};
    this.lastInteraction = null;
    this.userData = null;
    this.shortcuts = this.initializeShortcuts();
  }

  initializeShortcuts() {
    return {
      // Quick navigation
      'd': '/dashboard',
      'c': '/clients',
      'e': '/estimates',
      'p': '/payments',
      'cal': '/calendar',
      's': '/settings',
      'm': '/marketing',
      'cont': '/contractors',
      'v': '/vendors',
      'i': '/inbox',
      
      // Smart commands
      'nc': () => this.createNewClient(),
      'ne': () => this.createNewEstimate(),
      'np': () => this.createNewPayment(),
      'na': () => this.createNewAppointment(),
      'help': () => this.showHelp(),
      'stats': () => this.showStats(),
      'search': (query) => this.performSearch(query),
      'find': (query) => this.performSearch(query),
      'analyze': (type) => this.performAnalysis(type),
      'report': (type) => this.generateReport(type),
      'export': (type) => this.exportData(type),
      'backup': () => this.backupData(),
      'import': () => this.importData(),
      'sync': () => this.syncData(),
      'optimize': () => this.optimizePerformance(),
      'debug': () => this.debugMode(),
      'ai': (query) => this.askAI(query),
      'grok': (query) => this.askGrok(query),
      'copilot': (query) => this.askCopilot(query),
    };
  }

  // Context-aware processing
  async processInput(input, context = {}) {
    const processed = this.preprocessInput(input);
    const intent = await this.detectIntent(processed, context);
    const response = await this.generateResponse(intent, processed, context);
    
    this.updateContext(input, response, context);
    return response;
  }

  preprocessInput(input) {
    // Advanced preprocessing
    return {
      original: input,
      normalized: input.toLowerCase().trim(),
      tokens: this.tokenize(input),
      entities: this.extractEntities(input),
      intent: this.quickIntentDetection(input),
      commands: this.extractCommands(input),
      shortcuts: this.extractShortcuts(input),
    };
  }

  tokenize(input) {
    return input.toLowerCase().split(/\s+/).filter(token => token.length > 0);
  }

  extractEntities(input) {
    const entities = {};
    
    // Extract dates
    const datePatterns = [
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
      /\b(today|tomorrow|yesterday|next week|last week|this week)\b/gi,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    ];
    
    datePatterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) entities.dates = matches;
    });

    // Extract amounts
    const amountPattern = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    const amounts = input.match(amountPattern);
    if (amounts) entities.amounts = amounts;

    // Extract emails
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = input.match(emailPattern);
    if (emails) entities.emails = emails;

    // Extract phone numbers
    const phonePattern = /\b\d{3}-\d{3}-\d{4}\b|\(\d{3}\)\s*\d{3}-\d{4}\b/g;
    const phones = input.match(phonePattern);
    if (phones) entities.phones = phones;

    // Extract names (capitalized words)
    const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
    const names = input.match(namePattern);
    if (names) entities.names = names;

    return entities;
  }

  quickIntentDetection(input) {
    const normalized = input.toLowerCase();
    
    // Navigation intents
    if (normalized.match(/\b(go to|navigate to|open|show me|take me to)\b/)) {
      return 'navigation';
    }
    
    // Creation intents
    if (normalized.match(/\b(create|add|new|make)\b/)) {
      return 'creation';
    }
    
    // Search intents
    if (normalized.match(/\b(find|search|look for|where is|show)\b/)) {
      return 'search';
    }
    
    // Analysis intents
    if (normalized.match(/\b(analyze|report|summary|overview|stats)\b/)) {
      return 'analysis';
    }
    
    // Question intents
    if (normalized.match(/\b(what|how|when|where|why|which|who)\b/)) {
      return 'question';
    }
    
    // Command intents
    if (normalized.startsWith('/') || normalized.startsWith('!')) {
      return 'command';
    }
    
    return 'general';
  }

  extractCommands(input) {
    const commands = [];
    const normalized = input.toLowerCase();
    
    // Extract slash commands
    const slashCommands = normalized.match(/\/\w+/g);
    if (slashCommands) commands.push(...slashCommands);
    
    // Extract exclamation commands
    const exclamationCommands = normalized.match(/!\w+/g);
    if (exclamationCommands) commands.push(...exclamationCommands);
    
    return commands;
  }

  extractShortcuts(input) {
    const shortcuts = [];
    const normalized = input.toLowerCase().trim();
    
    // Check for exact shortcuts
    if (this.shortcuts[normalized]) {
      shortcuts.push(normalized);
    }
    
    // Check for shortcuts with parameters
    const parts = normalized.split(' ');
    if (parts.length > 1 && this.shortcuts[parts[0]]) {
      shortcuts.push({
        command: parts[0],
        params: parts.slice(1).join(' ')
      });
    }
    
    return shortcuts;
  }

  async detectIntent(processed, context) {
    // Advanced intent detection using multiple signals
    const signals = {
      keywords: this.analyzeKeywords(processed.tokens),
      entities: processed.entities,
      commands: processed.commands,
      shortcuts: processed.shortcuts,
      context: context,
      history: this.conversationHistory.slice(-5), // Last 5 interactions
      quickIntent: processed.intent,
    };
    
    // Combine signals for final intent
    return this.combineIntentSignals(signals);
  }

  analyzeKeywords(tokens) {
    const keywords = {
      navigation: ['go', 'navigate', 'open', 'show', 'take', 'page', 'section'],
      creation: ['create', 'add', 'new', 'make', 'build', 'generate', 'start'],
      search: ['find', 'search', 'look', 'where', 'locate', 'get'],
      analysis: ['analyze', 'report', 'summary', 'overview', 'stats', 'metrics'],
      modification: ['edit', 'update', 'change', 'modify', 'delete', 'remove'],
      question: ['what', 'how', 'when', 'where', 'why', 'which', 'who'],
      data: ['client', 'customer', 'estimate', 'payment', 'invoice', 'appointment'],
      time: ['today', 'tomorrow', 'yesterday', 'week', 'month', 'year'],
      status: ['overdue', 'pending', 'completed', 'cancelled', 'active'],
    };
    
    const scores = {};
    Object.keys(keywords).forEach(category => {
      scores[category] = tokens.filter(token => 
        keywords[category].includes(token)
      ).length;
    });
    
    return scores;
  }

  combineIntentSignals(signals) {
    // Advanced intent combination logic
    const intent = {
      primary: signals.quickIntent,
      confidence: 0.7,
      actions: [],
      context: signals.context,
      entities: signals.entities,
    };
    
    // Boost confidence with multiple signals
    if (signals.shortcuts.length > 0) {
      intent.confidence = 0.95;
      intent.actions.push('shortcut');
    }
    
    if (signals.commands.length > 0) {
      intent.confidence = 0.9;
      intent.actions.push('command');
    }
    
    // Add contextual actions
    if (signals.keywords.navigation > 0) {
      intent.actions.push('navigate');
    }
    
    if (signals.keywords.creation > 0) {
      intent.actions.push('create');
    }
    
    if (signals.keywords.search > 0) {
      intent.actions.push('search');
    }
    
    if (signals.keywords.analysis > 0) {
      intent.actions.push('analyze');
    }
    
    return intent;
  }

  async generateResponse(intent, processed, context) {
    // Handle shortcuts first (highest priority)
    if (processed.shortcuts.length > 0) {
      return this.handleShortcuts(processed.shortcuts, context);
    }
    
    // Handle commands
    if (processed.commands.length > 0) {
      return this.handleCommands(processed.commands, context);
    }
    
    // Handle primary intent
    switch (intent.primary) {
      case 'navigation':
        return this.handleNavigation(processed, intent);
      case 'creation':
        return this.handleCreation(processed, intent);
      case 'search':
        return this.handleSearch(processed, intent);
      case 'analysis':
        return this.handleAnalysis(processed, intent);
      case 'question':
        return this.handleQuestion(processed, intent);
      case 'command':
        return this.handleCommand(processed, intent);
      default:
        return this.handleGeneral(processed, intent, context);
    }
  }

  async handleShortcuts(shortcuts, context) {
    const results = [];
    
    for (const shortcut of shortcuts) {
      if (typeof shortcut === 'string') {
        const action = this.shortcuts[shortcut];
        if (typeof action === 'string') {
          results.push({
            type: 'navigation',
            path: action,
            message: `→ ${this.getPageName(action)}`
          });
        } else if (typeof action === 'function') {
          const result = await action();
          results.push(result);
        }
      } else if (typeof shortcut === 'object') {
        const action = this.shortcuts[shortcut.command];
        if (typeof action === 'function') {
          const result = await action(shortcut.params);
          results.push(result);
        }
      }
    }
    
    return results.length === 1 ? results[0] : results;
  }

  async handleNavigation(processed, intent) {
    const pages = {
      'dashboard': '/dashboard',
      'clients': '/clients',
      'customers': '/clients',
      'estimates': '/estimates',
      'quotes': '/estimates',
      'payments': '/payments',
      'invoices': '/payments',
      'calendar': '/calendar',
      'schedule': '/calendar',
      'appointments': '/calendar',
      'settings': '/settings',
      'marketing': '/marketing',
      'contractors': '/contractors',
      'team': '/contractors',
      'vendors': '/vendors',
      'inbox': '/inbox',
    };
    
    for (const token of processed.tokens) {
      if (pages[token]) {
        return {
          type: 'navigation',
          path: pages[token],
          message: `→ ${this.getPageName(pages[token])}`
        };
      }
    }
    
    return {
      type: 'help',
      message: 'I can navigate to: dashboard, clients, estimates, payments, calendar, settings, marketing, contractors, vendors, inbox'
    };
  }

  async handleCreation(processed, intent) {
    const creationMap = {
      'client': '/clients',
      'customer': '/clients',
      'estimate': '/estimates',
      'quote': '/estimates',
      'payment': '/payments',
      'invoice': '/payments',
      'appointment': '/calendar',
      'meeting': '/calendar',
      'contract': '/contracts',
      'project': '/projects',
      'task': '/tasks',
    };
    
    for (const token of processed.tokens) {
      if (creationMap[token]) {
        return {
          type: 'navigation',
          path: creationMap[token],
          message: `→ ${this.getPageName(creationMap[token])} - Ready to create new ${token}`,
          action: 'create'
        };
      }
    }
    
    return {
      type: 'help',
      message: 'I can help you create: clients, estimates, payments, appointments, contracts, projects, tasks'
    };
  }

  async handleSearch(processed, intent) {
    // Smart search with context
    const searchTerms = processed.tokens.filter(token => 
      !['find', 'search', 'look', 'where', 'show', 'me'].includes(token)
    );
    
    if (searchTerms.length === 0) {
      return {
        type: 'help',
        message: 'What would you like to search for? Try: "find overdue payments" or "search John Smith"'
      };
    }
    
    // Perform intelligent search
    const results = await this.performIntelligentSearch(searchTerms, intent.entities);
    
    return {
      type: 'search',
      results: results,
      message: `Found ${results.length} results for "${searchTerms.join(' ')}"`
    };
  }

  async handleAnalysis(processed, intent) {
    const analysisTypes = {
      'revenue': 'revenue_analysis',
      'clients': 'client_analysis',
      'payments': 'payment_analysis',
      'estimates': 'estimate_analysis',
      'performance': 'performance_analysis',
      'trends': 'trend_analysis',
      'forecast': 'forecast_analysis',
    };
    
    for (const token of processed.tokens) {
      if (analysisTypes[token]) {
        const analysis = await this.performAnalysis(analysisTypes[token]);
        return {
          type: 'analysis',
          analysisType: token,
          data: analysis,
          message: `${token.charAt(0).toUpperCase() + token.slice(1)} Analysis Complete`
        };
      }
    }
    
    return {
      type: 'help',
      message: 'I can analyze: revenue, clients, payments, estimates, performance, trends, forecast'
    };
  }

  async handleQuestion(processed, intent) {
    // Smart question handling with context
    const questionHandlers = {
      'what': this.handleWhatQuestions,
      'how': this.handleHowQuestions,
      'when': this.handleWhenQuestions,
      'where': this.handleWhereQuestions,
      'why': this.handleWhyQuestions,
      'which': this.handleWhichQuestions,
      'who': this.handleWhoQuestions,
    };
    
    const questionWord = processed.tokens.find(token => questionHandlers[token]);
    if (questionWord) {
      return questionHandlers[questionWord].call(this, processed, intent);
    }
    
    // Fallback to general AI
    return this.callBackendAI(processed.original);
  }

  async handleGeneral(processed, intent, context) {
    // Try to understand context and provide intelligent response
    const contextualResponse = await this.generateContextualResponse(processed, context);
    
    if (contextualResponse) {
      return contextualResponse;
    }
    
    // Fallback to backend AI
    return this.callBackendAI(processed.original);
  }

  async callBackendAI(input) {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: {
            current_page: window.location.pathname,
            timestamp: new Date().toISOString(),
            conversation_history: this.conversationHistory.slice(-10),
            user_context: this.userContext,
          }
        }),
      });
      
      const data = await response.json();
      return {
        type: 'ai',
        message: data.success ? data.response : 'I had trouble processing that. Please try again.',
        confidence: data.confidence || 0.7
      };
    } catch (error) {
      console.error('Backend AI error:', error);
      return {
        type: 'error',
        message: 'AI service temporarily unavailable. Try basic commands like "clients" or "dashboard".'
      };
    }
  }

  // Helper methods
  getPageName(path) {
    const pageNames = {
      '/dashboard': 'Dashboard',
      '/clients': 'Clients',
      '/estimates': 'Estimates',
      '/payments': 'Payments',
      '/calendar': 'Calendar',
      '/settings': 'Settings',
      '/marketing': 'Marketing',
      '/contractors': 'Contractors',
      '/vendors': 'Vendors',
      '/inbox': 'Inbox',
    };
    return pageNames[path] || 'Page';
  }

  updateContext(input, response, context) {
    this.conversationHistory.push({
      input: input,
      response: response,
      timestamp: new Date(),
      context: context
    });
    
    // Keep only last 20 interactions
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
    
    this.lastInteraction = new Date();
  }

  // Placeholder methods for advanced features
  async performIntelligentSearch(terms, entities) {
    // This would connect to your backend search API
    return [];
  }

  async performAnalysis(type) {
    // This would connect to your analytics API
    return {};
  }

  async generateContextualResponse(processed, context) {
    // Advanced contextual response generation
    return null;
  }

  // Question handlers
  async handleWhatQuestions(processed, intent) {
    return { type: 'question', message: 'What would you like to know?' };
  }

  async handleHowQuestions(processed, intent) {
    return { type: 'question', message: 'How can I help you?' };
  }

  async handleWhenQuestions(processed, intent) {
    return { type: 'question', message: 'When do you need this done?' };
  }

  async handleWhereQuestions(processed, intent) {
    return { type: 'question', message: 'Where would you like to go?' };
  }

  async handleWhyQuestions(processed, intent) {
    return { type: 'question', message: 'Why do you ask?' };
  }

  async handleWhichQuestions(processed, intent) {
    return { type: 'question', message: 'Which option would you prefer?' };
  }

  async handleWhoQuestions(processed, intent) {
    return { type: 'question', message: 'Who are you looking for?' };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
