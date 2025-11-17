// src/services/authService.js
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    });

    // 요청 인터셉터
    api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
    );

    // 응답 인터셉터
    api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('Response Error:', error.response?.data || error.message);
        
        // 401 Unauthorized - 토큰 만료
        if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
    );

    /**
     * Auth 서비스
     */
    const authService = {
    
    // ========== 로그인 ==========
    /**
     * 로그인
     */
    login: async (memberId, memberPw) => {
        try {
        const response = await api.post('/member/login', {
            memberId,
            memberPw,
        });
        
        if (response.data.success) {
            // 토큰 저장
            const token = response.data.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('memberId', response.data.data.memberId);
            localStorage.setItem('memberName', response.data.data.memberName);
            localStorage.setItem('memberNickname', response.data.data.memberNickname);
        }
        
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '로그인에 실패했습니다.' 
        };
        }
    },

    /**
     * 로그아웃
     */
    logout: async () => {
        try {
        const response = await api.post('/member/logout');
        localStorage.clear();
        return response.data;
        } catch (error) {
        localStorage.clear();
        throw error.response?.data || { 
            success: false, 
            message: '로그아웃에 실패했습니다.' 
        };
        }
    },

    // ========== 회원가입 ==========
    /**
     * 아이디 중복 확인
     */
    checkMemberId: async (memberId) => {
        try {
        const response = await api.get(`/member/check-id/${memberId}`);
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '아이디 확인에 실패했습니다.' 
        };
        }
    },

    /**
     * 이메일 인증 코드 발송
     */
    sendVerificationCode: async (email) => {
        try {
        const response = await api.post('/member/send-verification-code', {
            email,
        });
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '인증 코드 발송에 실패했습니다.' 
        };
        }
    },

    /**
     * 이메일 인증 코드 확인
     */
    verifyEmailCode: async (email, code) => {
        try {
        const response = await api.post('/member/verify-email-code', {
            email,
            code,
        });
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '인증 코드 확인에 실패했습니다.' 
        };
        }
    },

    /**
     * 회원가입
     */
    joinMember: async (memberData) => {
        try {
        const response = await api.post('/member/join', memberData);
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '회원가입에 실패했습니다.' 
        };
        }
    },

    // ========== 비밀번호 재설정 ==========
    /**
     * 비밀번호 재설정 링크 발송
     */
    sendPasswordResetLink: async (memberId, email) => {
        try {
        const response = await api.post('/member/api/auth/password/reset-request', {
            memberId,
            email,
        });
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '비밀번호 재설정 링크 발송에 실패했습니다.' 
        };
        }
    },

    /**
     * 토큰 유효성 검증
     */
    validateToken: async (token) => {
        try {
        const response = await api.get('/member/api/auth/password/validate-token', {
            params: { token },
        });
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '토큰 검증에 실패했습니다.' 
        };
        }
    },

    /**
     * 비밀번호 재설정
     */
    resetPassword: async (token, newPassword, confirmPassword) => {
        try {
        const response = await api.post('/member/api/auth/password/reset', {
            token,
            newPassword,
            confirmPassword,
        });
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '비밀번호 재설정에 실패했습니다.' 
        };
        }
    },

    /**
     * 아이디 찾기 (이메일 발송)
     */
    searchMemberId: async (memberName, email) => {
        try {
        const response = await api.post('/member/api/auth/id/search', {
            memberName,
            email,
        });
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '아이디 찾기에 실패했습니다.' 
        };
        }
    },

    // ========== 회원 정보 조회 ==========
    /**
     * 내 정보 조회
     */
    getMyInfo: async () => {
        try {
        const response = await api.get('/member/me');
        return response.data;
        } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: '회원 정보 조회에 실패했습니다.' 
        };
        }
    },
};

export default authService;