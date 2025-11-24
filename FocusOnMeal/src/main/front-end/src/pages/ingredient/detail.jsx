import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './detail.module.css';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

function IngredientDetail() {
    const { id } = useParams();
    const navigate = useNavigate(); 
    
    const [itemInfo, setItemInfo] = useState(null); 
    const [priceHistory, setPriceHistory] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isWished, setIsWished] = useState(false); 
    const [priceList, setPriceList] = useState([]);
    
    // 추가: 가격 추이 데이터
    const [priceTrendData, setPriceTrendData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                
                // 1. 기본 상세 정보
                const response = await axios.get(`/ingredient/api/detail/${id}`);
                const info = response.data.info || null;
                const history = response.data.history || [];
                
                // 가격 정보 추가 처리
                if (info && history.length > 0) {
                    const latestPrice = history[0];
                    info.currentPrice = latestPrice.priceValue;
                    info.collectedDate = latestPrice.collectedDate;
                    info.pricePer100g = Math.floor(latestPrice.priceValue / 10);
                    
                    // 어제 가격 찾기
                    const latestDate = new Date(latestPrice.collectedDate);
                    const previousDayStart = new Date(latestDate);
                    previousDayStart.setDate(previousDayStart.getDate() - 1);
                    previousDayStart.setHours(0, 0, 0, 0);
                    
                    const previousDayEnd = new Date(latestDate);
                    previousDayEnd.setHours(0, 0, 0, 0);
                    
                    const yesterdayPrice = history.find(h => {
                        const hDate = new Date(h.collectedDate);
                        return hDate >= previousDayStart && hDate < previousDayEnd;
                    });
                    
                    if (yesterdayPrice) {
                        info.yesterdayPrice = yesterdayPrice.priceValue;
                        info.yesterdayCollectedDate = yesterdayPrice.collectedDate;
                        
                        if (info.currentPrice && info.yesterdayPrice > 0) {
                            const changePercent = ((info.currentPrice - info.yesterdayPrice) / info.yesterdayPrice) * 100;
                            info.priceChangePercent = Math.round(changePercent * 10) / 10;
                        }
                    }
                }
                
                info.safetyStatus = ['safe', 'warning', 'danger'][Math.floor(Math.random() * 3)];
                
                setItemInfo(info); 
                setPriceHistory(history);
                
                // 2. 가격 추이 데이터 가져오기 (30일)
                if (token) {
                    try {
                        const trendResponse = await axios.get(
                            `/api/mypage/price-chart/${id}?days=30`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );
                        console.log('📈 가격 추이 데이터:', trendResponse.data);
                        console.log('📊 변동률 정보:', trendResponse.data.changeRate);
                        setPriceTrendData(trendResponse.data);
                    } catch (trendError) {
                        console.error('가격 추이 데이터 로드 실패:', trendError);
                    }

                    // 찜 상태 확인
                    try {
                        const favoriteResponse = await axios.get('/api/mypage/favorites');
                        
                        if (favoriteResponse.data && Array.isArray(favoriteResponse.data)) {
                            const isFavorited = favoriteResponse.data.some(fav => fav.ingredientId === parseInt(id));
                            setIsWished(isFavorited);
                        }
                    } catch {
                        // 찜 상태 확인 실패 시 무시
                    }
                }

                // 기존 가격 히스토리를 recharts용으로 변환
                if (history && history.length > 0) {
                    const mapped = history.map(h => ({
                        date: h.collectedDate,
                        price: h.priceValue
                    }));
                    setPriceList(mapped.reverse());
                }

            } catch (error) {
                console.error("상세 정보 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleWishClick = async () => {
        try {
            const response = await axios.post(`/ingredient/detail/${id}/favorite`);
            if (response.data.success) {
                setIsWished(response.data.isFavorite);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                alert("로그인이 필요합니다.");
            } else {
                alert("오류가 발생했습니다.");
            }
        }
    };

    // Y축 도메인 계산 (100 또는 500 단위)
    const calculateYAxisDomain = (dataPoints) => {
        if (!dataPoints || dataPoints.length === 0) return [0, 10000];
        
        const prices = dataPoints.map(point => point.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const range = maxPrice - minPrice;
        const unit = range > 5000 ? 500 : 100;
        
        const paddedMin = Math.floor(minPrice / unit) * unit - unit;
        const paddedMax = Math.ceil(maxPrice / unit) * unit + unit;
        
        console.log(`📊 Y축 범위: ${paddedMin.toLocaleString()} ~ ${paddedMax.toLocaleString()}원 (단위: ${unit}원)`);
        
        return [Math.max(0, paddedMin), paddedMax];
    };

    // 변동률 표시 컴포넌트
    const PriceChangeDisplay = ({ changeRate }) => {
        if (!changeRate) {
            console.log('⚠️ changeRate 데이터 없음');
            return null;
        }

        console.log('💰 현재 가격:', changeRate.currentPrice);
        console.log('📈 주간 변동:', {
            rate: changeRate.weeklyChange,
            diff: changeRate.weeklyPriceDiff
        });
        console.log('📈 월간 변동:', {
            rate: changeRate.monthlyChange,
            diff: changeRate.monthlyPriceDiff
        });

        return (
            <div className={styles.priceChangeInfo}>
                <div className={styles.changeBox}>
                    <span className={styles.changeLabel}>현재 가격</span>
                    <span className={styles.changeValue}>
                        {changeRate.currentPrice?.toLocaleString() || 'N/A'}원
                    </span>
                </div>
                
                {changeRate.weeklyChange !== null && changeRate.weeklyChange !== undefined && (
                    <div className={styles.changeBox}>
                        <span className={styles.changeLabel}>주간 변동</span>
                        <span className={`${styles.changeValue} ${
                            changeRate.weeklyChange > 0 ? styles.priceUp : 
                            changeRate.weeklyChange < 0 ? styles.priceDown : 
                            styles.priceStable
                        }`}>
                            {changeRate.weeklyChange > 0 ? '↑' : 
                            changeRate.weeklyChange < 0 ? '↓' : '→'} 
                            {Math.abs(changeRate.weeklyChange).toFixed(2)}%
                            {changeRate.weeklyPriceDiff !== null && changeRate.weeklyPriceDiff !== undefined && (
                                <span className={styles.priceDiffSmall}>
                                    {' '}({changeRate.weeklyPriceDiff > 0 ? '+' : ''}
                                    {changeRate.weeklyPriceDiff.toLocaleString()}원)
                                </span>
                            )}
                        </span>
                    </div>
                )}
                
                {changeRate.monthlyChange !== null && changeRate.monthlyChange !== undefined && (
                    <div className={styles.changeBox}>
                        <span className={styles.changeLabel}>월간 변동</span>
                        <span className={`${styles.changeValue} ${
                            changeRate.monthlyChange > 0 ? styles.priceUp : 
                            changeRate.monthlyChange < 0 ? styles.priceDown : 
                            styles.priceStable
                        }`}>
                            {changeRate.monthlyChange > 0 ? '↑' : 
                            changeRate.monthlyChange < 0 ? '↓' : '→'} 
                            {Math.abs(changeRate.monthlyChange).toFixed(2)}%
                            {changeRate.monthlyPriceDiff !== null && changeRate.monthlyPriceDiff !== undefined && (
                                <span className={styles.priceDiffSmall}>
                                    {' '}({changeRate.monthlyPriceDiff > 0 ? '+' : ''}
                                    {changeRate.monthlyPriceDiff.toLocaleString()}원)
                                </span>
                            )}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className={styles.container}>로딩 중...</div>;
    
    if (!itemInfo) {
        return (
            <div className={styles.container}>
                <h2>식품성분표 상세 페이지</h2>
                <p>'{id}'에 해당하는 정보를 찾을 수 없습니다.</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    const safetyText = itemInfo.safetyStatus === 'safe' ? '안전'
                        : itemInfo.safetyStatus === 'warning' ? '주의'
                        : '위험';
    const safetyClass = itemInfo.safetyStatus === 'safe' ? styles.safe 
                        : itemInfo.safetyStatus === 'warning' ? styles.warning 
                        : styles.danger;
    
    const hasPriceChange = itemInfo.priceChangePercent !== null && itemInfo.priceChangePercent !== undefined;
    const changeIndicator = hasPriceChange && itemInfo.priceChangePercent >= 0 ? '▲' : '▼';
    const changeColor = hasPriceChange && itemInfo.priceChangePercent >= 0 ? '#dc3545' : '#007aff';

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>식품성분표 상세 페이지</h2>
            
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                뒤로가기
            </button>
            
            <div className={styles.mainContent}>
                
                {/* 1. 왼쪽 컬럼: 영양 성분 */}
                <div className={styles.leftColumn}>
                    <div className={styles.nutritionSection}>
                        <h3 className={styles.sectionTitle}>영양 성분 표</h3>
                        
                        <div className={styles.nutritionTablePlaceholder}>
                            <table className={styles.nutritionTable}>
                                <thead>
                                    <tr>
                                        <th>&nbsp; 구분</th>
                                        <th>&nbsp; 함량</th>
                                        <th>&nbsp; 수치</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className={styles.noDataRow}>
                                        <td colSpan="3">NUTRITION_MASTER 테이블에 데이터가 없습니다.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 2. 오른쪽 컬럼: 정보 박스들 */}
                <div className={styles.rightColumn}>
                    <h1 className={styles.itemTitle}>
                        {itemInfo.name}
                        <span className={styles.categoryInTitle}>
                            ({itemInfo.category})
                        </span>
                    </h1>
                    
                    {/* 2-1. 상단 요약 박스 */}
                    <div className={styles.infoBoxTop}>
                        <div className={styles.itemSummary}>
                            <div className={styles.priceLine}>
                                <strong>가격</strong>
                                <span style={{marginLeft: '10px', color: '#666', fontSize: '0.9em', fontWeight: 'normal'}}>
                                    ({itemInfo.standardUnit && !itemInfo.standardUnit.startsWith('1') ? '1' + itemInfo.standardUnit : itemInfo.standardUnit}):
                                </span>
                                <span className={styles.currentPriceValue}>
                                    {itemInfo.currentPrice ? `${itemInfo.currentPrice.toLocaleString()}원` : '정보 없음'}
                                </span>
                                
                                {itemInfo.pricePer100g > 0 && ( 
                                    <span className={styles.pricePer100g}>
                                        (100g당 {itemInfo.pricePer100g.toLocaleString()}원)
                                    </span>
                                )}
                            </div>
                            
                            {/* 전일 대비 가격 변동 */}
                            {hasPriceChange && (
                                <div style={{fontSize: '0.9em', color: '#666', marginTop: '10px', marginBottom: '10px'}}>
                                    {itemInfo.priceChangePercent === 0 ? (
                                        <>
                                            <span>전일 대비 변동 없음</span>
                                            {itemInfo.yesterdayPrice && itemInfo.yesterdayCollectedDate && (
                                                <span style={{marginLeft: '8px', color: '#999'}}>
                                                    (전일: {itemInfo.yesterdayPrice.toLocaleString()}원, {new Date(itemInfo.yesterdayCollectedDate).toLocaleDateString('ko-KR', {
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })})
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <span style={{color: changeColor, fontWeight: 'bold'}}>
                                                전일 대비 {changeIndicator}{Math.abs(itemInfo.priceChangePercent).toFixed(1)}%
                                            </span>
                                            {itemInfo.yesterdayPrice && itemInfo.yesterdayCollectedDate && (
                                                <span style={{marginLeft: '8px', color: '#999'}}>
                                                    (전일: {itemInfo.yesterdayPrice.toLocaleString()}원, {new Date(itemInfo.yesterdayCollectedDate).toLocaleDateString('ko-KR', {
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })})
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {!hasPriceChange && itemInfo.currentPrice && (
                                <div style={{fontSize: '0.9em', color: '#999', marginTop: '10px', marginBottom: '10px'}}>
                                    전일 가격 정보 없음
                                </div>
                            )}

                            {/* 안전 위험도 */}
                            <div className={styles.safetyLine}>
                                <strong>안전 위험도:</strong> 
                                <span className={safetyClass}>{safetyText}</span>
                                
                                <span className={styles.tooltipContainer}>
                                    <span className={styles.helpIcon}>?</span>
                                    <div className={styles.tooltipBox}>
                                        <h4 className={styles.tooltipTitle}>안전 위험도 기준</h4>
                                        <p className={styles.tooltipDanger}>
                                            <strong>🔴 위험:</strong> 
                                            <span className={styles.tooltipTextContent}>
                                                최근 3개월 이내 식약처 회수 명령, 또는 농약/중금속 부적합 판정 등이 있었을 경우.
                                            </span>
                                        </p>
                                        <p className={styles.tooltipWarning}>
                                            <strong>🟠 주의:</strong> 
                                            <span className={styles.tooltipTextContent}>
                                                가격 변동률 ±20% 이상 등 급격한 불안정, 또는 계절적 품질 저하 우려가 있는 경우.
                                            </span>
                                        </p>
                                        <p className={styles.tooltipSafe}>
                                            <strong>🟢 안전:</strong> 
                                            <span className={styles.tooltipTextContent}>
                                                위의 위험 및 주의 조건에 해당하지 않는 경우.
                                            </span>
                                        </p>
                                    </div>
                                </span>
                            </div>
                        </div>
                        <div className={styles.topActions}>
                            <button onClick={handleWishClick} className={`${styles.wishButton} ${isWished ? styles.wished : ''}`}>
                                {isWished ? '❤️ 찜하기' : '🤍 찜하기'}
                            </button>
                            <span className={styles.safetyBadge}>가격 알림</span>
                            <span className={styles.safetyBadge}>안전 알림</span>
                        </div>
                    </div>
                    
                    {/* 2-2. 가격 변동 추이 그래프 박스 */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.boxTitle}>가격 변동 추이 그래프 (최근 일주일)</h3>
                        
                        {/* 변동률 정보 표시 */}
                        {priceTrendData && priceTrendData.changeRate && (
                            <PriceChangeDisplay changeRate={priceTrendData.changeRate} />
                        )}

                        <div className={styles.chartArea}>
                            {priceTrendData && priceTrendData.dataPoints && priceTrendData.dataPoints.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart 
                                        data={priceTrendData.dataPoints}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(v) =>
                                                new Date(v).toLocaleDateString("ko-KR", {
                                                    month: "short",
                                                    day: "numeric"
                                                })
                                            }
                                            stroke="#666"
                                        />

                                        <YAxis
                                            domain={calculateYAxisDomain(priceTrendData.dataPoints)}
                                            tickFormatter={(v) => `${v.toLocaleString()}`}
                                            label={{ 
                                                value: '가격 (원)', 
                                                angle: -90, 
                                                position: 'insideLeft',
                                                style: { textAnchor: 'middle' }
                                            }}
                                            stroke="#666"
                                        />

                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString()}원`, '가격']}
                                            labelFormatter={(label) =>
                                                new Date(label).toLocaleDateString("ko-KR", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                })
                                            }
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                padding: '10px'
                                            }}
                                        />
                                        <Legend />

                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#4F75FF"
                                            strokeWidth={2.5}
                                            name="가격 (원)"
                                            dot={{ r: 4, fill: '#4F75FF' }}
                                            activeDot={{ r: 6, fill: '#3A5BC7' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{textAlign: 'center', color: '#aaa', padding: '50px 0'}}>
                                    📊 가격 추이 데이터가 없습니다
                                </div>
                            )}
                        </div>
                        
                        {priceTrendData && (
                            <div style={{
                                marginTop: '10px', 
                                fontSize: '0.85em', 
                                color: '#666', 
                                textAlign: 'center'
                            }}>
                                📅 조회 기간: {priceTrendData.startDate} ~ {priceTrendData.endDate}
                            </div>
                        )}
                    </div>
                    
                    {/* 2-3. 식자재 정보 박스 */}
                    <div className={styles.infoBox}>
                        <h3 className={styles.boxTitle}>식자재 정보</h3>
                        <div className={styles.specInfo}>
                            <div className={styles.specRow}><span>카테고리:</span> {itemInfo.category || '-'}</div>
                            <div className={styles.specRow}>
                                <span>기준 단위:</span> 
                                {itemInfo.standardUnit ? (!itemInfo.standardUnit.startsWith('1') ? '1' + itemInfo.standardUnit : itemInfo.standardUnit) : '-'}
                            </div>
                            <div className={styles.specRow}><span>KAMIS 품목코드:</span> {itemInfo.kamisItemCode || '-'}</div>
                            <div className={styles.specRow}><span>KAMIS 품종코드:</span> {itemInfo.kamisKindCode || '-'}</div>
                            <div className={styles.specRow}>
                                <span>최근 수집일:</span> 
                                {itemInfo.collectedDate ? new Date(itemInfo.collectedDate).toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }).replace(/\. /g, '-').replace('.', '') : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IngredientDetail;