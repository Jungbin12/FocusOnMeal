import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './FindPassword.module.css';

function FindPassword() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        memberId: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
        if (isSuccess) setIsSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSuccess(false);
        setLoading(true);

        try {
            const response = await authService.sendPasswordResetLink(
                formData.memberId,
                formData.email
            );
            
            console.log('비밀번호 재설정 API 응답:', response);

            if (response.data.success) {
                setIsSuccess(true);
            }
        } catch (err) {
            console.error('비밀번호 재설정 오류:', err);
            const errorMessage = err.response?.data?.error || '요청 처리 중 오류가 발생했습니다.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <h2 className={styles.successTitle}>
                        ✅ 재설정 링크 전송 완료
                    </h2>

                    <p className={styles.successMessage}>
                        입력하신 이메일({formData.email})로 전송되었습니다.
                    </p>

                    <button
                        onClick={() => navigate('/member/login')}
                        className={styles.submitButton}
                    >
                        로그인 페이지로 이동
                    </button>

                    <button
                        onClick={() => setIsSuccess(false)}
                        className={styles.secondaryButton}
                    >
                        다시 입력하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>비밀번호 찾기</h2>

                {error && (
                    <div className={styles.errorBox}>{error}</div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>아이디</label>
                        <input
                            type="text"
                            name="memberId"
                            value={formData.memberId}
                            onChange={handleChange}
                            placeholder="아이디를 입력하세요"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            required
                            className={styles.input}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <span
                        onClick={() => navigate('/member/login')}
                        className={styles.footerLink}
                    >
                        로그인
                    </span>

                    <span className={styles.divider}>|</span>

                    <span
                        onClick={() => navigate('/member/findId')}
                        className={styles.footerLink}
                    >
                        아이디 찾기
                    </span>

                    <span className={styles.divider}>|</span>

                    <span
                        onClick={() => navigate('/member/join')}
                        className={styles.footerLink}
                    >
                        회원가입
                    </span>
                </div>
            </div>
        </div>
    );
}

export default FindPassword;