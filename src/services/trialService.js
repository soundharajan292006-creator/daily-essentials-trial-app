import api from './api';

export const trialService = {
  createTrialRequest: async (trialData) => {
    const response = await api.post('/trials', trialData);
    return response.data;
  },
  
  getMyTrialRequests: async () => {
    const response = await api.get('/trials/my');
    return response.data;
  }
};
