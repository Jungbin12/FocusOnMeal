import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './priceAlert.module.css';
import Sidebar from '../../components/mypage/Sidebar';
import Pagination from '../../components/common/Pagination';

const PriceAlert = () => {

    // 1. 데이터 상태 관리
    const [priceAlertList, setPriceAlertList] = useState([]);
    
    // 2. 유저 알림 설정 상태
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false); // 전체 알림 ON/OFF
    const [watchedIngredients, setWatchedIngredients] = useState([]); // 지정가 알림 설정한 식자재 목록

    // 페이지네이션 & 검색 & 정렬 상태
    const [pageInfo, setPageInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sortColumn, setSortColumn] = useState("alertId");
    const [sortOrder, setSortOrder] = useState("desc");

    const handleSearch = () =>{
        setCurrentPage(1);
        setFetchSearchType(searchType);
        setFetchSearchKeyword(searchKeyword);
    }

    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    // 알림 수신 여부 토글 핸들러
    const handleToggleNotification = async () => {
        const newValue = !isNotificationEnabled;

        try {
            await axios.patch("/api/mypage/settings/safetyAlert/toggle", {
                notificationEnabled: newValue ? 'Y' : 'N'
            });

            setIsNotificationEnabled(newValue);

            if (newValue) {
                alert("모든 가격 변동 알림을 수신합니다.");
            } else {
                alert("전체 알림이 해제되었습니다.\n(지정가 알림은 계속 수신됩니다.)");
            }
        } catch (err) {
            console.error("설정 변경 실패:", err);
            alert("설정 변경에 실패했습니다.");
        }
    };

    // 메시지 파싱 함수: "메시지||ingredientId" 형식에서 순수 메시지 추출
    const parseMessage = (message) => {
        if (!message) return { text: '', ingredientId: null };
        const parts = message.split('||');
        return {
            text: parts[0] || '',
            ingredientId: parts[1] ? parseInt(parts[1]) : null
        };
    };

    // 알림 내역을 화면에 맞는 형식으로 변환
    const transformAlertList = (alerts) => {
        return alerts.map(alert => {
            const parsed = parseMessage(alert.message);
            // 메시지에서 식재료명 추출 (예: "[양파] ↑ 상승 5.00%...")
            const nameMatch = parsed.text.match(/\[(.+?)\]/);
            const ingredientName = nameMatch ? nameMatch[1] : '알 수 없음';

            // 알림 유형 판단
            let condition = alert.type || '가격정보';
            if (parsed.text.includes('지정가')) condition = '지정가 도달';
            else if (parsed.text.includes('상승')) condition = '가격 상승';
            else if (parsed.text.includes('하락')) condition = '가격 하락';

            return {
                alertId: alert.notificationId,
                ingredientName,
                condition,
                message: parsed.text.replace(/\[.+?\]\s*/, ''), // [식재료명] 제거
                price: null, // API 응답에 가격이 포함되지 않음
                alertDate: alert.sentAt,
                link: parsed.ingredientId ? `/ingredient/detail/${parsed.ingredientId}` : '#',
                isRead: alert.isRead
            };
        });
    };

    // 데이터 조회
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/mypage/settings/priceAlert', {
                    params: {
                        page: currentPage,
                        keyword: fetchSearchKeyword,
                        sortColumn: sortColumn === 'alertId' ? 'sentAt' : sortColumn,
                        sortOrder: sortOrder,
                        readStatus: 'all'
                    }
                });

                const data = response.data;

                // 알림 내역 변환 및 설정
                const transformedAlerts = transformAlertList(data.alertList || []);
                setPriceAlertList(transformedAlerts);
                setPageInfo(data.pageInfo);
                setIsNotificationEnabled(data.userSetting === 'Y');

                // 지정가 알림 설정 목록 변환
                const watchedList = (data.watchedIngredients || []).map(item => ({
                    ingredientId: item.ingredientId,
                    name: item.ingredientName,
                    targetPrice: item.targetPrice || 0
                }));
                setWatchedIngredients(watchedList);

            } catch (err) {
                console.error("데이터 조회 실패:", err);
                // 에러 시 빈 상태로 설정
                setPriceAlertList([]);
                setPageInfo(null);
                setWatchedIngredients([]);
            }
        };

        fetchData();
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn, sortOrder]);

    return(
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.main}>
                
                {/* 상단 설정 영역 */}
                <div className={styles.settingsCard}>
                    <div className={styles.settingHeader}>
                        <div>
                            <h2 className={styles.settingTitle}>가격 알림 설정</h2>
                            <p className={styles.settingDesc}>
                                {isNotificationEnabled 
                                    ? "현재 모든 주요 식자재의 급등락 정보를 수신하고 있습니다."
                                    : "전체 알림이 꺼져 있습니다. 지정가 알림만 수신합니다."}
                            </p>
                        </div>
                        
                        {/* 토글 스위치 */}
                        <div className={styles.toggleWrapper}>
                            <span className={styles.toggleLabel}>전체 알림</span>
                            <label className={styles.toggleSwitch}>
                                <input
                                    type="checkbox"
                                    checked={isNotificationEnabled}
                                    onChange={handleToggleNotification}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>

                    {/* 개별 구독(지정가) 정보 */}
                    {!isNotificationEnabled && (
                        <div className={styles.subscriptionBox}>
                            <span className={styles.subTitle}>📉 지정가 알림 설정 중:</span>
                            {watchedIngredients.length > 0 ? (
                                <div className={styles.tagContainer}>
                                    {watchedIngredients.map((ing) => (
                                        <Link 
                                            key={ing.ingredientId} 
                                            to={`/ingredient/detail/${ing.ingredientId}`}
                                            className={styles.ingredientTag}
                                        >
                                            {ing.name} ({ing.targetPrice.toLocaleString()}원)
                                        </Link>
                                    ))}
                                    <Link to="/ingredient/list" className={styles.addTagBtn}>+ 추가</Link>
                                </div>
                            ) : (
                                <span className={styles.emptyText}>
                                    설정된 지정가 알림이 없습니다. 상세페이지에서 원하는 가격을 설정해보세요.
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* 검색 및 리스트 영역 */}
                <div className={styles.contentHeader}>
                    <h3 className={styles.listTitle}>지난 알림 내역</h3>
                    <div className={styles.searchBox}>
                        <select
                            value={searchType}
                            onChange={e => setSearchType(e.target.value)}
                            className={styles.selectBox}
                        >
                            <option value="all">전체</option>
                            <option value="ingredient">식자재명</option>
                            <option value="condition">알림 조건</option>
                        </select>
                        <input
                            type="text"
                            placeholder="검색어 입력"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                            onKeyDown={handleSearchOnEnter}
                            className={styles.searchInput}
                        />
                        <button onClick={handleSearch} className={styles.searchBtn}>검색</button>
                    </div>
                </div>

                {/* 테이블 */}
                <table className={styles.alertTable}>
                    <thead>
                        <tr>
                            <th className={styles.idCol} onClick={() => handleSort("alertId")}>
                                No. <span className={styles.sortArrow}>{sortColumn === "alertId" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th style={{width: '15%'}} onClick={() => handleSort("ingredientName")}>
                                식자재명 <span className={styles.sortArrow}>{sortColumn === "ingredientName" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th style={{width: '15%'}} onClick={() => handleSort("condition")}>
                                알림 유형 <span className={styles.sortArrow}>{sortColumn === "condition" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th className={styles.titleCol} onClick={() => handleSort("message")}>
                                내용 <span className={styles.sortArrow}>{sortColumn === "message" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            {/*<th className={styles.priceCol} onClick={() => handleSort("price")}>*/}
                            {/*    당시 가격 <span className={styles.sortArrow}>{sortColumn === "price" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>*/}
                            {/*</th>*/}
                            <th className={styles.dateCol} onClick={() => handleSort("alertDate")}>
                                알림일 <span className={styles.sortArrow}>{sortColumn === "alertDate" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th className={styles.linkCol}>이동</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priceAlertList?.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyRow}>알림 내역이 없습니다.</td>
                            </tr>
                        ) : (
                            priceAlertList.map((alert) => (
                                <tr key={alert.alertId}>
                                    <td>{alert.alertId}</td>
                                    <td style={{fontWeight:'bold'}}>{alert.ingredientName}</td>
                                    <td>
                                        <span className={alert.condition.includes("급락") || alert.condition.includes("도달") 
                                            ? styles.badgeGood // 긍정적(가격하락)일 때 사용할 스타일 
                                            : styles.badgeHazard // 부정적(가격상승)일 때 기존 스타일
                                        }>
                                            {alert.condition}
                                        </span>
                                    </td>
                                    <td>{alert.message}</td>
                                    {/*<td>{alert.price ? `${alert.price.toLocaleString()}원` : "-"}</td>*/}
                                    <td>{alert.alertDate ? new Date(alert.alertDate).toLocaleDateString("ko-KR") : "-"}</td>
                                    <td>
                                        <Link to={alert.link} className={styles.linkBtn}>상세</Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <Pagination 
                    pageInfo={pageInfo}
                    currentPage={currentPage}
                    changePage={(page) => setCurrentPage(page)}
                />
            </div>
        </div>
    )
}

export default PriceAlert;