import apiClient from '../lib/apiClient';

export interface CreateReviewData {
  booking_id: string;
  rating: number;
  comment?: string;
}

class ReviewService {
  async createReview(data: CreateReviewData) {
    return apiClient.post('/reviews', data);
  }

  async getWorkerReviews(workerId: string, params?: { page?: number; limit?: number }) {
    return apiClient.get(`/reviews/worker/${workerId}`, { params });
  }

  async updateReview(id: string, data: Partial<CreateReviewData>) {
    return apiClient.put(`/reviews/${id}`, data);
  }

  async deleteReview(id: string) {
    return apiClient.delete(`/reviews/${id}`);
  }
}

export const reviewService = new ReviewService();
export default reviewService;
