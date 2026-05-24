import apiClient from './apiClient';

export interface LoginCredentials {
  phone: string;
  password?: string;
}

export interface RegisterData {
  full_name: string;
  phone: string;
  role: 'customer' | 'worker';
  email?: string;
  password?: string;
  worker_data?: {
    trade: string;
    experience_years: number;
    city: string;
    area: string;
    cnic: string;
    description?: string;
    min_charge: number;
    hourly_rate: number;
    visit_charge: number;
    portfolio_photos?: any[];
    service_areas?: string[];
  };
}

export interface OTPRequest {
  phone: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

export interface OTPVerification {
  phone: string;
  otp: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

class AuthService {
  async sendOTP(data: OTPRequest) {
    return apiClient.post('/auth/send-otp', data);
  }

  async verifyOTP(data: OTPVerification) {
    return apiClient.post('/auth/verify-otp', data);
  }

  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data);

    if (response.data) {
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('ustaad_token', accessToken);
      localStorage.setItem('ustaad_refresh_token', refreshToken);
      localStorage.setItem('ustaad_user', JSON.stringify(user));
      localStorage.setItem('ustaad_role', user.role);
    }

    return response;
  }

  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/login', credentials);

    if (response.data) {
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('ustaad_token', accessToken);
      localStorage.setItem('ustaad_refresh_token', refreshToken);
      localStorage.setItem('ustaad_user', JSON.stringify(user));
      localStorage.setItem('ustaad_role', user.role);
    }

    return response;
  }

  async loginWithOTP(phone: string, otp: string) {
    const response = await apiClient.post('/auth/login-otp', { phone, otp });

    if (response.data) {
      const { user, accessToken, refreshToken } = response.data;
      localStorage.setItem('ustaad_token', accessToken);
      localStorage.setItem('ustaad_refresh_token', refreshToken);
      localStorage.setItem('ustaad_user', JSON.stringify(user));
      localStorage.setItem('ustaad_role', user.role);
    }

    return response;
  }

  async logout() {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('ustaad_token');
    localStorage.removeItem('ustaad_refresh_token');
    localStorage.removeItem('ustaad_user');
    localStorage.removeItem('ustaad_role');
  }

  async getProfile() {
    return apiClient.get('/auth/profile');
  }

  async updateProfile(data: any) {
    return apiClient.put('/auth/profile', data);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('ustaad_token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('ustaad_user');
    return user ? JSON.parse(user) : null;
  }
}

export const authService = new AuthService();
export default authService;
