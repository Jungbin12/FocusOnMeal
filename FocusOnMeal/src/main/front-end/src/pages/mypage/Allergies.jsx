import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from "../../components/mypage/Sidebar";
import styles from './Allergies.module.css';

const Allergies = () => {
    const [allergies, setAllergies] = useState([]);
    const [checked, setChecked] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const API_BASE_URL = "http://localhost:8080";

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await Promise.all([loadAllergyList(), loadUserAllergies()]);
        } catch (error) {
            console.error("데이터 로딩 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllergyList = async () => {
        try {
            console.log(`📤 요청: ${API_BASE_URL}/api/mypage/allergy/list`);
            
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/mypage/allergy/list`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            console.log("📥 알레르기 응답:", res.data);
            setAllergies(res.data || []);
        } catch (error) {
            console.error("❌ 알레르기 목록 조회 오류:", error);
            console.error("상태:", error.response?.status);
            console.error("응답:", error.response?.data);
        }
    };

    const loadUserAllergies = async () => {
        try {
            console.log(`📤 요청: ${API_BASE_URL}/api/mypage/allergies`);
            
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.warn("⚠️ 토큰 없음");
                setChecked([]);
                return;
            }
            
            const res = await axios.get(`${API_BASE_URL}/api/mypage/allergies`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            
            console.log("📥 사용자 알레르기 응답:", res.data);
            console.log("📥 응답 타입:", typeof res.data, Array.isArray(res.data));
            
            // 다양한 응답 형식 처리
            let allergyIds = [];
            if (Array.isArray(res.data)) {
                allergyIds = res.data;
            } else if (res.data && Array.isArray(res.data.allergies)) {
                allergyIds = res.data.allergies;
            } else if (res.data && Array.isArray(res.data.allergyIds)) {
                allergyIds = res.data.allergyIds;
            }
            
            // 숫자 배열로 변환 (문자열로 올 수도 있음)
            allergyIds = allergyIds.map(id => typeof id === 'number' ? id : parseInt(id)).filter(id => !isNaN(id));
            
            console.log("✅ 최종 체크될 알레르기 ID:", allergyIds);
            setChecked(allergyIds);
        } catch (error) {
            console.error("❌ 사용자 알레르기 조회 오류:", error);
            console.error("상태:", error.response?.status);
            console.error("응답:", error.response?.data);
            
            // 500 에러가 발생해도 빈 배열로 초기화 (백엔드 오류 대응)
            if (error.response?.status === 500) {
                console.warn("⚠️ 서버 오류로 인해 빈 배열로 초기화합니다.");
            }
            setChecked([]);
        }
    };

    const toggleCheck = (allergyId) => {
        setChecked((prev) => {
            if (allergyId === 1) {
                return prev.includes(1) ? [] : [1];
            }
            
            const filteredPrev = prev.filter(id => id !== 1);
            
            if (filteredPrev.includes(allergyId)) {
                return filteredPrev.filter(id => id !== allergyId);
            } else {
                return [...filteredPrev, allergyId];
            }
        });
    };

    const handleSave = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }
            
            console.log("📤 저장 요청:", checked);
            
            await axios.post(
                "http://localhost:8080/api/mypage/allergies",
                { allergyIds: checked },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );
            
            alert("알레르기 정보가 저장되었습니다!");
        } catch (error) {
            console.error("❌ 저장 오류:", error);
            alert(error.response?.data?.error || "저장에 실패했습니다.");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>로딩 중...</p>
            </div>
        );
    }

    if (allergies.length === 0) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <p className={styles.errorTitle}>
                        알레르기 데이터가 없습니다.
                    </p>
                    <p className={styles.errorMessage}>
                        브라우저 콘솔(F12)에서 오류를 확인해주세요.
                    </p>
                    <button onClick={loadData} className={styles.refreshButton}>
                        새로고침
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.content}>
                <div className={styles.card}>
                    <h2 className={styles.title}>알레르기 정보</h2>

                    <div className={styles.infoBox}>
                        <p>📊 총 알레르기: {allergies.length}개</p>
                    </div>

                    <div className={styles.grid}>
                        {allergies.map((allergy) => {
                            const allergyId = allergy.allergyId;
                            const allergyName = allergy.allergyName;
                            const isChecked = checked.includes(allergyId);
                            
                            return (
                                <label
                                    key={allergyId}
                                    className={`${styles.checkboxLabel} ${isChecked ? styles.checked : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleCheck(allergyId)}
                                        className={styles.checkbox}
                                    />
                                    <span className={styles.checkboxText}>{allergyName}</span>
                                </label>
                            );
                        })}
                    </div>

                    {checked.length > 0 && (
                        <div className={styles.selectedBox}>
                            <p className={styles.selectedTitle}>
                                선택된 알레르기 ({checked.length}개):
                            </p>
                            {checked.length > 0 ? (
                                <p className={styles.selectedList}>
                                    {allergies
                                        .filter(a => checked.includes(a.allergyId))
                                        .map(a => a.allergyName)
                                        .join(', ')}
                                </p>
                            ) : (
                                <p className={styles.emptyMessage}>선택된 알레르기가 없어요!</p>
                            )}
                        </div>
                    )}

                    <div className={styles.buttonContainer}>
                        <button onClick={handleSave} className={styles.saveButton}>
                            확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Allergies;
