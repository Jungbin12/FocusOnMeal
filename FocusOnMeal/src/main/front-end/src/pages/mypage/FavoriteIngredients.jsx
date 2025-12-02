import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import styles from './favoriteIngredients.module.css';
import Sidebar from '../../components/mypage/Sidebar';

const FavoriteIngredients = () => {
    // 1. 상태 관리
    const [favoriteList, setFavoriteList] = useState([]); // 전체 데이터
    const [filteredList, setFilteredList] = useState([]); // 필터링된 데이터
    const [activeCategory, setActiveCategory] = useState('ALL'); // 현재 선택된 카테고리
    const [categories, setCategories] = useState(['ALL']); // 카테고리 목록
    
    const categoryIconMap = {
    '채소류': '🌱',
    '과일류': '🍒',
    '육류': '🍗',
    '수산물': '🐟',
    '곡류': '🌾',
    '유제품': '🥛',
    '가공식품': '🥫',
    '기타': '🍳'
};

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const res = await axios.get("/api/mypage/ingredients/favorite", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // 서버에서 넘어오는 favorites 리스트
                const data = res.data;

                setFavoriteList(data);
                setFilteredList(data);

                // 카테고리 목록 만들기
                const uniqueCategories = [
                    "ALL",
                    ...new Set(data.map(item => item.category))
                ];
                setCategories(uniqueCategories);

            } catch (err) {
                console.error("관심 식재료 조회 실패:", err);
            }
        };

        fetchFavorites();
    }, []);


    const getCategoryIcon = (categoryName) => {
        // 매핑된 아이콘이 있으면 해당 아이콘을, 없으면 기본 아이콘(GiCookingPot)을 사용
        const icon = categoryIconMap[categoryName] || '🍽️'; // 기본값
        
        // 아이콘 스타일 (크기, 색상 등) 조정
        return <span style={{ fontSize: '40px', lineHeight: '1' }}>{icon}</span>;
    };

    // 3. 카테고리 필터링 핸들러
    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        if (category === 'ALL') {
            setFilteredList(favoriteList);
        } else {
            setFilteredList(favoriteList.filter(item => item.category === category));
        }
    };

    // 4. 찜 해제 핸들러
    const handleRemoveFavorite = async (e, favoriteId, ingredientId, name) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm(`'${name}'을(를) 관심 목록에서 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem("token");

            // DELETE 대신 POST로 변경, URL도 수정
            await axios.post(`/ingredient/detail/${ingredientId}/favorite`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            

    // UI 업데이트
    const updatedList = favoriteList.filter(item => item.favoriteId !== favoriteId);
    setFavoriteList(updatedList);

    if (activeCategory === "ALL") {
        setFilteredList(updatedList);
    } else {
        setFilteredList(updatedList.filter(item => item.category === activeCategory));
    }

    } catch (err) {
        console.error("찜 해제 실패:", err);
        alert("찜 해제 중 오류가 발생했습니다.");
    }
};


    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.main}>
                <div className={styles.header}>
                    <h1>나의 관심 식재료</h1>
                    <p>자주 찾는 식재료를 찜해두고 시세 변동을 확인하세요.</p>
                </div>

                {/* 카테고리 탭 */}
                <div className={styles.categoryTab}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`${styles.tabBtn} ${activeCategory === cat ? styles.active : ''}`}
                            onClick={() => handleCategoryClick(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 리스트 영역 (그리드) */}
                <div className={styles.gridContainer}>
                    {filteredList.length > 0 ? (
                        filteredList.map((item) => (
                            <Link 
                                to={`/ingredient/detail/${item.ingredientId}`} 
                                key={item.favoriteId} 
                                className={styles.card}
                            >
                                <div className={styles.cardIcon}>
                                    {/* 식재료 이미지 또는 아이콘 */}
                                    {/* {(item.ingredientName ?? '').charAt(0)} */}
                                    {getCategoryIcon(item.category)}
                                </div>
                                <div className={styles.cardInfo}>
                                    <span className={styles.categoryBadge}>{item.category}</span>
                                    <h3 className={styles.cardTitle}>{item.ingredientName}</h3>
                                    <p className={styles.cardPrice}>오늘의 가격 : {item.currentPrice} 원</p>
                                    <p className={styles.cardUnit}>기준: {item.standardUnit}</p>
                                </div>
                                <button 
                                    className={styles.deleteBtn}
                                    onClick={(e) => handleRemoveFavorite(e, item.favoriteId, item.ingredientId, item.ingredientName)}
                                    title="찜 해제"
                                >
                                    ♥
                                </button>
                            </Link>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>등록된 관심 식재료가 없습니다.</p>
                            <Link to="/ingredient/list" className={styles.goLink}>식재료 둘러보기</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoriteIngredients;