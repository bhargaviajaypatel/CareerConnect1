import { 
  MOCK_USERS, 
  MOCK_COMPANIES, 
  MOCK_INTERVIEWS, 
  MOCK_SCHEDULED_INTERVIEWS,
  MOCK_STATISTICS,
  MOCK_AUTH,
  TEST_CREDENTIALS 
} from '../mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
  // Auth endpoints
  login: async (email, password) => {
    await delay(500);
    const user = MOCK_USERS.find(u => u.email === email);
    if (user && (password === TEST_CREDENTIALS.user.password || password === TEST_CREDENTIALS.admin.password)) {
      return {
        user,
        token: user.role === 'admin' ? MOCK_AUTH.admin.token : MOCK_AUTH.user.token
      };
    }
    throw new Error('Invalid credentials');
  },

  // User endpoints
  getCurrentUser: async () => {
    await delay(300);
    return MOCK_USERS[0];
  },

  updateUserProfile: async (userData) => {
    await delay(500);
    return { ...MOCK_USERS[0], ...userData };
  },

  // Company endpoints
  getCompanies: async () => {
    await delay(300);
    return MOCK_COMPANIES;
  },

  getCompanyById: async (id) => {
    await delay(200);
    return MOCK_COMPANIES.find(c => c.id === id);
  },

  // Interview endpoints
  getInterviews: async () => {
    await delay(300);
    return MOCK_INTERVIEWS;
  },

  getScheduledInterviews: async (userId) => {
    await delay(200);
    return MOCK_SCHEDULED_INTERVIEWS.filter(i => i.userId === userId);
  },

  scheduleInterview: async (interviewData) => {
    await delay(500);
    return {
      ...interviewData,
      id: String(MOCK_SCHEDULED_INTERVIEWS.length + 1),
      status: 'Scheduled'
    };
  },

  // Statistics endpoints
  getStatistics: async () => {
    await delay(300);
    return MOCK_STATISTICS;
  },

  // Placement endpoints
  getPlacementStats: async () => {
    await delay(300);
    return MOCK_STATISTICS.placementStats;
  },

  // Error simulation for testing error handling
  simulateError: async () => {
    await delay(500);
    throw new Error('Simulated API error');
  }
};

export default mockApiService;
