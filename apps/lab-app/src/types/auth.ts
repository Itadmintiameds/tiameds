export interface LoginRequest {
    username: string;
    password: string;
}

export interface ErrorResponse {
    message: string;
    statusCode: number;
}

export interface Module {
    id: number;
    name: string;
}

export interface LoginResponseData {
    id?: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    modules?: Module[];
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    enabled?: boolean;
    is_verified?: boolean; // Use snake_case as per API response
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginResponse {
    status: string; // e.g., "OK" or "ERROR"
    message: string; // e.g., "Login successful"
    token?: string | null; // Optional legacy JWT token
    data: LoginResponseData; // User data object
}



//data is null
export interface RegisterResponse {
    status: string;
    message: string;
    data: null;
}

// OTP Flow Types
export interface OtpLoginResponse {
    status: string;
    message: string;
    data: {
        email: string;
        message: string;
    };
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyOtpResponse {
    status: string;
    message: string;
    data: LoginResponseData;
}


