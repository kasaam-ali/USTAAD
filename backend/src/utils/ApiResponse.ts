class ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: any;
  meta?: any;

  constructor(statusCode: number, message: string, data: any = null, meta?: any) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  static success(message: string, data: any = null, meta?: any): ApiResponse {
    return new ApiResponse(200, message, data, meta);
  }

  static created(message: string, data: any = null): ApiResponse {
    return new ApiResponse(201, message, data);
  }

  static noContent(message = 'No content'): ApiResponse {
    return new ApiResponse(204, message);
  }
}

export default ApiResponse;
