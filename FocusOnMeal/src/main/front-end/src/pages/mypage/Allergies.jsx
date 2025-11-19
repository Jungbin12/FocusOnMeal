import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Allergies = () => {
    const [allergies, setAllergies] = useState([]);
    const [checked, setChecked] = useState([]);

    useEffect(() => {
        loadAllergyList();
        loadUserAllergies();
    }, []);

    /** 알레르기 전체 목록 조회 */
    const loadAllergyList = async () => {
        try {
            const res = await axios.get("/api/allergy/list");
            setAllergies(res.data);
        } catch (error) {
            console.error("알레르기 목록 조회 오류:", error);
        }
    };

    /** 로그인한 사용자의 기존 알레르기 조회 */
    const loadUserAllergies = async () => {
        try {
            const res = await axios.get("/api/mypage/allergies");
            setChecked(res.data.allergies || []);
        } catch (error) {
            console.error("사용자 알레르기 조회 오류:", error);
        }
    };

    /** 체크 토글 */
    const toggleCheck = (id) => {
        setChecked((prev) =>
            prev.includes(id)
                ? prev.filter(a => a !== id)
                : [...prev, id]
        );
    };

    /** 저장 */
    const handleSave = async () => {
        try {
            await axios.post("/api/mypage/allergies", {
                allergyIds: checked
            });
            alert("알레르기 정보가 저장되었습니다!");
        } catch (error) {
            console.error("알레르기 저장 오류:", error);
            alert("저장에 실패했습니다. 다시 시도해주세요.");
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
                maxWidth: '800px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '3px solid #3b82f6',
                padding: '40px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                
                {/* 제목 */}
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '30px'
                }}>
                    알레르기 정보
                </h2>

                {/* 체크박스 그리드 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    {allergies.map((allergy) => (
                        <label
                            key={allergy.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                fontSize: '16px',
                                color: '#374151',
                                userSelect: 'none'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={checked.includes(allergy.id)}
                                onChange={() => toggleCheck(allergy.id)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    marginRight: '8px',
                                    cursor: 'pointer',
                                    accentColor: '#3b82f6'
                                }}
                            />
                            <span>{allergy.name}</span>
                        </label>
                    ))}
                </div>

                {/* 확인 버튼 */}
                <div style={{ textAlign: 'right' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '12px 40px',
                            backgroundColor: '#84cc16',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#65a30d'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#84cc16'}
                    >
                        확인
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Allergies;