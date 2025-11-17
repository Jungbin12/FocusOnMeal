// src/components/auth/FindPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const findPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        memberId: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
        const response = await authService.sendPasswordResetLink(
            formData.memberId,
            formData.email
        );

        if (response.success) {
            navigate('/find-password-result', { 
            state: { email: formData.email } 
            });
        } else {
            setError(response.message || '처리 중 오류가 발생했습니다.');
        }
        } catch (err) {
        setError(err.message || '서버와의 통신에 실패했습니다.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '40px', maxWidth: '450px', width: '100%' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: '8px' }}>
            🔐 비밀번호 찾기
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
            가입하신 아이디와 이메일을 입력해주세요.
            </p>

            {error && (
            <div style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #dc2626', padding: '12px', marginBottom: '20px', borderRadius: '6px' }}>
                <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
            </div>
            )}

            <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                아이디
                </label>
                <input
                type="text"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                이메일
                </label>
                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{
                width: '100%',
                padding: '14px',
                borderRadius: '6px',
                fontWeight: '600',
                color: 'white',
                border: 'none',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
            </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
            <a href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>로그인</a>
            <span style={{ color: '#d1d5db', margin: '0 8px' }}>|</span>
            <a href="/find-id" style={{ color: '#2563eb', textDecoration: 'none' }}>아이디 찾기</a>
            <span style={{ color: '#d1d5db', margin: '0 8px' }}>|</span>
            <a href="/terms-agreement" style={{ color: '#2563eb', textDecoration: 'none' }}>회원가입</a>
            </div>
        </div>
        </div>
    );
};

export default findPassword;