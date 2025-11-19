import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import TermsContent from "../member/TermsContent";
import PrivacyContent from "../member/PrivacyContent";

const MyForm = () => {
    const navigate = useNavigate();
    const [agreements, setAgreements] = useState({
        all: false,
        terms: false,
        privacy: false,
    });

    const [modal, setModal] = useState({
        open: false,
        type: null,
    });

    const handleAllCheck = (e) => {
        const isChecked = e.target.checked;
        setAgreements({
            all: isChecked,
            terms: isChecked,
            privacy: isChecked,
        });
    };

    const handleIndividualCheck = (name) => {
        const newAgreements = {
            ...agreements,
            [name]: !agreements[name],
        };
        newAgreements.all = newAgreements.terms && newAgreements.privacy;
        setAgreements(newAgreements);
    };

    const handleNext = () => {
        if (!agreements.terms || !agreements.privacy) {
            alert("모든 필수 약관에 동의해야 합니다.");
            return;
        }

        // ✅ 수정: 경로 확인
        // App.jsx에 설정된 라우트에 따라 선택
        navigate('/member/join'); // 또는 '/join'
    };

    const isAllChecked = agreements.terms && agreements.privacy;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', fontFamily: 'Malgun Gothic, sans-serif', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '450px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', padding: '50px 40px', animation: 'slideUp 0.5s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        회원가입
                    </h2>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' }}>약관동의</h4>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>약관 내용에 동의해주세요.</p>
                </div>

                <div>
                    <div style={{ background: '#f8f9ff', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '2px solid #e0e0e0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: '0' }}>
                            <input
                                type="checkbox"
                                checked={agreements.all}
                                onChange={handleAllCheck}
                                style={{ width: '20px', height: '20px', cursor: 'pointer', marginRight: '12px', accentColor: '#667eea' }}
                            />
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>전체 동의</span>
                        </label>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreements.terms}
                                onChange={() => handleIndividualCheck("terms")}
                                style={{ width: '20px', height: '20px', cursor: 'pointer', marginRight: '12px', accentColor: '#667eea', flexShrink: '0' }}
                            />
                            <label htmlFor="terms" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', cursor: 'pointer', fontSize: '14px', flex: '1', margin: '0' }}>
                                <span style={{ color: '#667eea', fontWeight: '600', marginRight: '8px', flexShrink: '0' }}>[필수]</span>
                                <button
                                    type="button"
                                    onClick={() => setModal({ open: true, type: "terms" })}
                                    style={{ background: 'none', border: 'none', color: '#333', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', padding: '0', transition: 'color 0.3s ease' }}
                                    onMouseOver={(e) => e.target.style.color = '#667eea'}
                                    onMouseOut={(e) => e.target.style.color = '#333'}
                                >
                                    FocusOnMale 이용약관
                                </button>
                                <span style={{ color: '#333', marginLeft: '4px' }}> 동의</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', padding: '15px 0' }}>
                            <input
                                type="checkbox"
                                id="privacy"
                                checked={agreements.privacy}
                                onChange={() => handleIndividualCheck("privacy")}
                                style={{ width: '20px', height: '20px', cursor: 'pointer', marginRight: '12px', accentColor: '#667eea', flexShrink: '0' }}
                            />
                            <label htmlFor="privacy" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', cursor: 'pointer', fontSize: '14px', flex: '1', margin: '0' }}>
                                <span style={{ color: '#667eea', fontWeight: '600', marginRight: '8px', flexShrink: '0' }}>[필수]</span>
                                <button
                                    type="button"
                                    onClick={() => setModal({ open: true, type: "privacy" })}
                                    style={{ background: 'none', border: 'none', color: '#333', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', padding: '0', transition: 'color 0.3s ease' }}
                                    onMouseOver={(e) => e.target.style.color = '#667eea'}
                                    onMouseOut={(e) => e.target.style.color = '#333'}
                                >
                                    개인정보 수집 및 이용
                                </button>
                                <span style={{ color: '#333', marginLeft: '4px' }}> 동의</span>
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={!isAllChecked}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '10px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: 'white',
                            border: 'none',
                            cursor: isAllChecked ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            marginTop: '10px',
                            background: isAllChecked ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                            boxShadow: isAllChecked ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none'
                        }}
                        onMouseOver={(e) => {
                            if (isAllChecked) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (isAllChecked) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                    >
                        다음
                    </button>
                </div>
            </div>

            <Modal
                isOpen={modal.open}
                onClose={() => setModal({ open: false, type: null })}
                title={
                    modal.type === "terms" ? "이용약관" : "개인정보 처리방침"
                }
            >
                {modal.type === "terms" ? <TermsContent /> : <PrivacyContent />}
            </Modal>
        </div>
    );
};

export default MyForm;