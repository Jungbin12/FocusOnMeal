import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/admin/Sidebar';
import styles from './ApiManagement.module.css';

const ApiManagement = () => {
    const [loading, setLoading] = useState({
        kamis: false,
        safety: false,
        priceAlert: false
    });
    const [results, setResults] = useState({
        kamis: null,
        safety: null,
        priceAlert: null
    });

    const handleSync = async (type) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        setLoading(prev => ({ ...prev, [type]: true }));
        setResults(prev => ({ ...prev, [type]: null }));

        const endpoints = {
            kamis: '/api/admin/sync/kamis',
            safety: '/api/admin/sync/safety',
            priceAlert: '/api/admin/sync/priceAlert'
        };

        try {
            const response = await axios.post(endpoints[type], {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(prev => ({ ...prev, [type]: { success: true, data: response.data } }));
        } catch (error) {
            console.error(`${type} 동기화 실패:`, error);
            setResults(prev => ({
                ...prev,
                [type]: {
                    success: false,
                    error: error.response?.data?.error || '동기화 중 오류가 발생했습니다.'
                }
            }));
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const apiCards = [
        {
            key: 'kamis',
            title: 'KAMIS 가격 데이터',
            description: '농산물유통정보(KAMIS) API에서 최신 가격 데이터를 동기화합니다.',
            icon: '💰'
        },
        {
            key: 'safety',
            title: '식품안전 정보',
            description: '식품안전정보원 API에서 최근 3일의 식품안전정보를 동기화합니다.',
            icon: '🛡️'
        },
        {
            key: 'priceAlert',
            title: '가격 변동 알림',
            description: '가격 변동이 발생한 식재료에 대해 회원들에게 알림을 생성합니다.',
            icon: '🔔'
        }
    ];

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.main}>
                <h1>API 관리</h1>
                <p className={styles.subtitle}>외부 API 데이터 동기화를 수동으로 실행할 수 있습니다.</p>

                <div className={styles.cardContainer}>
                    {apiCards.map(card => (
                        <div key={card.key} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardIcon}>{card.icon}</span>
                                <h3>{card.title}</h3>
                            </div>
                            <p className={styles.cardDescription}>{card.description}</p>

                            <button
                                className={styles.syncBtn}
                                onClick={() => handleSync(card.key)}
                                disabled={loading[card.key]}
                            >
                                {loading[card.key] ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        동기화 중...
                                    </>
                                ) : (
                                    '동기화 실행'
                                )}
                            </button>

                            {results[card.key] && (
                                <div className={`${styles.resultBox} ${results[card.key].success ? styles.success : styles.error}`}>
                                    {results[card.key].success ? (
                                        <>
                                            <div className={styles.resultTitle}>동기화 완료</div>
                                            <div className={styles.resultContent}>
                                                {results[card.key].data.message}
                                                {results[card.key].data.result && (
                                                    <div className={styles.resultDetail}>
                                                        {results[card.key].data.result}
                                                    </div>
                                                )}
                                                {results[card.key].data.savedCount !== undefined && (
                                                    <div className={styles.resultDetail}>
                                                        저장된 항목: {results[card.key].data.savedCount}건
                                                    </div>
                                                )}
                                                <div className={styles.resultDuration}>
                                                    소요 시간: {results[card.key].data.duration}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={styles.resultTitle}>동기화 실패</div>
                                            <div className={styles.resultContent}>
                                                {results[card.key].error}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApiManagement;
