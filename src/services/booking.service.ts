import apiClient from '../lib/apiClient';

export interface CreateBookingData {
  worker_id: string;
  description: string;
  scheduled_date: string;
  time_preference: 'morning' | 'afternoon' | 'evening';
  address: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateBookingData {
  status?: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  final_price?: number;
  worker_notes?: string;
  cancellation_reason?: string;
}

class BookingService {
  async createBooking(data: CreateBookingData) {
    return apiClient.post('/bookings', data);
  }

  async getBookings(params?: { status?: string; page?: number; limit?: number }) {
    return apiClient.get('/bookings', { params });
  }

  async getBookingById(id: string) {
    return apiClient.get(`/bookings/${id}`);
  }

  async updateBookingStatus(id: string, data: UpdateBookingData) {
    return apiClient.put(`/bookings/${id}/status`, data);
  }

  async cancelBooking(id: string, reason: string) {
    return apiClient.post(`/bookings/${id}/cancel`, { cancellation_reason: reason });
  }
}

export const bookingService = new BookingService();
export default bookingService;
