import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './FindId.module.css';

function FindId() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        memberName: '',
        email: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [emailSent, setEmailSent] = useState(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.memberName.trim()) {
            newErrors.memberName = '이름을 입력해주세요.';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = '올바른 이메일 형식이 아닙니다.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            
            const response = await authService.sendMemberIdByEmail(
                formData.memberName,
                formData.email
            );
            
            console.log('아이디 찾기 API 응답:', response);
            
            if (response.data.success) {
                setEmailSent(true);
            }
        } catch (error) {
            console.error('아이디 찾기 오류:', error);
            const errorMessage = error.response?.data?.error || '일치하는 회원 정보를 찾을 수 없습니다.';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h2 className={styles.title}>아이디 찾기</h2>
                    <p className={styles.subtitle}>가입 시 입력한 정보를 입력해주세요.</p>
                </div>

                {errors.general && (
                    <div className={styles.errorBox}>{errors.general}</div>
                )}

                {!emailSent ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                이름 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                name="memberName"
                                value={formData.memberName}
                                onChange={handleChange}
                                placeholder="가입 시 입력한 이름"
                                className={`${styles.input} ${errors.memberName ? styles.error : ''}`}
                            />
                            {errors.memberName && (
                                <p className={styles.errorMessage}>{errors.memberName}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                이메일 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="가입 시 입력한 이메일"
                                className={`${styles.input} ${errors.email ? styles.error : ''}`}
                            />
                            {errors.email && (
                                <p className={styles.errorMessage}>{errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? '처리 중...' : '아이디 찾기'}
                        </button>

                        <div className={styles.footer}>
                            <span
                                onClick={() => navigate('/member/login')}
                                className={styles.footerLink}
                            >
                                로그인
                            </span>
                            <span className={styles.divider}>|</span>

                            <span
                                onClick={() => navigate('/member/findPassword')}
                                className={styles.footerLink}
                            >
                                비밀번호 찾기
                            </span>
                            <span className={styles.divider}>|</span>

                            <span
                                onClick={() => navigate('/member/join')}
                                className={styles.footerLink}
                            >
                                회원가입
                            </span>
                        </div>
                    </form>
                ) : (
                    <div className={styles.successContainer}>
                        <h2 className={styles.successTitle}>✅ 이메일 발송 완료</h2>
                        <p className={styles.successMessage}>
                            {formData.email}로<br />
                            아이디 찾기 결과를 발송했습니다.
                        </p>
                        <button
                            onClick={() => navigate('/member/login')}
                            className={styles.submitButton}
                        >
                            로그인하러 가기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FindId;