import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MemberDelete = () => {
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = "http://localhost:8080";

    const handleDelete = async () => {
        // 유효성 검사
        if (!password) {
            alert('비밀번호를 입력해주세요.');
            return;
        }

        if (confirmText !== '회원탈퇴') {
            alert('"회원탈퇴"를 정확히 입력해주세요.');
            return;
        }

        // 최종 확인
        if (!window.confirm('정말로 탈퇴하시겠습니까?\n\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.')) {
            return;
        }

        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');

            await axios.delete(`${API_BASE_URL}/api/member/delete`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { password: password }
            });

            // 로그아웃 처리
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('memberId');
            sessionStorage.removeItem('memberName');
            sessionStorage.removeItem('memberNickname');
            sessionStorage.removeItem('adminYn');

            alert('회원 탈퇴가 완료되었습니다.');
            navigate('/');
        } catch (error) {
            console.error('회원 탈퇴 오류:', error);
            alert(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '40px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '3px solid #ef4444',
                padding: '40px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    회원 탈퇴
                </h2>

                {/* 경고 메시지 */}
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '2px solid #fecaca',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '30px'
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#dc2626',
                        marginBottom: '10px'
                    }}>
                        ⚠️ 회원 탈퇴 시 유의사항
                    </h3>
                    <ul style={{
                        listStyle: 'disc',
                        paddingLeft: '20px',
                        color: '#991b1b',
                        fontSize: '14px',
                        lineHeight: '1.8'
                    }}>
                        <li>회원 정보가 영구적으로 삭제됩니다.</li>
                        <li>작성한 식단, 찜한 식재료 등 모든 데이터가 삭제됩니다.</li>
                        <li>탈퇴 후에는 데이터를 복구할 수 없습니다.</li>
                        <li>동일한 아이디로 재가입이 불가능할 수 있습니다.</li>
                    </ul>
                </div>

                {/* 비밀번호 입력 */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                    }}>
                        비밀번호 확인 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* 확인 문구 입력 */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                    }}>
                        "회원탈퇴" 입력 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="회원탈퇴"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                        탈퇴를 원하시면 위 입력란에 "회원탈퇴"를 정확히 입력해주세요.
                    </p>
                </div>

                {/* 버튼 영역 */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: loading ? '#9ca3af' : '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.target.style.backgroundColor = '#dc2626';
                        }}
                    >
                        {loading ? '처리 중...' : '탈퇴하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberDelete;