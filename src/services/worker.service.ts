import apiClient from '../lib/apiClient';

export interface WorkerSearchParams {
  trade?: string;
  city?: string;
  area?: string;
  min_rating?: number;
  max_price?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

class WorkerService {
  async searchWorkers(params: WorkerSearchParams) {
    return apiClient.get('/workers/search', { params });
  }

  async getWorkerById(id: string) {
    return apiClient.get(`/workers/${id}`);
  }

  async updateWorkerProfile(data: any) {
    return apiClient.put('/workers/profile', data);
  }

  async getWorkerStats() {
    return apiClient.get('/workers/stats/me');
  }
}

export const workerService = new WorkerService();
export default workerService;
