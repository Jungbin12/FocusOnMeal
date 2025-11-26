import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './favoriteIngredients.module.css';
import Sidebar from '../../components/mypage/Sidebar';

const FavoriteIngredients = () => {
    // 1. 상태 관리
    const [favoriteList, setFavoriteList] = useState([]); // 전체 데이터
    const [filteredList, setFilteredList] = useState([]); // 필터링된 데이터
    const [activeCategory, setActiveCategory] = useState('ALL'); // 현재 선택된 카테고리
    const [categories, setCategories] = useState(['ALL']); // 카테고리 목록

    // 2. 데이터 조회 (Mock Data)
    useEffect(() => {
        // 실제로는 axios.get('/api/mypage/favorite') 호출
        const mockData = [
            { favoriteId: 1, ingredientId: 10, name: '양파', category: '채소류', standardUnit: 'kg', isCustom: 'N' },
            { favoriteId: 2, ingredientId: 22, name: '삼겹살', category: '육류', standardUnit: '100g', isCustom: 'N' },
            { favoriteId: 3, ingredientId: 15, name: '계란(30구)', category: '난류', standardUnit: '판', isCustom: 'N' },
            { favoriteId: 4, ingredientId: 5,  name: '사과', category: '과일류', standardUnit: 'kg', isCustom: 'N' },
            { favoriteId: 5, ingredientId: 33, name: '시금치', category: '채소류', standardUnit: '단', isCustom: 'N' },
            { favoriteId: 6, ingredientId: 12, name: '쌀(백미)', category: '곡류', standardUnit: 'kg', isCustom: 'N' },
        ];

        setFavoriteList(mockData);
        setFilteredList(mockData);

        // 존재하는 카테고리 추출 (중복 제거)
        const uniqueCategories = ['ALL', ...new Set(mockData.map(item => item.category))];
        setCategories(uniqueCategories);

    }, []);

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
    const handleRemoveFavorite = (e, favoriteId, name) => {
        e.preventDefault(); // 링크 이동 방지
        e.stopPropagation();

        if (window.confirm(`'${name}'을(를) 관심 목록에서 삭제하시겠습니까?`)) {
            // API 호출: axios.delete(`/api/favorite/${favoriteId}`)
            
            // UI 업데이트 (낙관적 업데이트)
            const updatedList = favoriteList.filter(item => item.favoriteId !== favoriteId);
            setFavoriteList(updatedList);
            
            // 현재 필터 상태 유지하며 리스트 갱신
            if (activeCategory === 'ALL') {
                setFilteredList(updatedList);
            } else {
                setFilteredList(updatedList.filter(item => item.category === activeCategory));
            }
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
                                    {item.name.charAt(0)}
                                </div>
                                <div className={styles.cardInfo}>
                                    <span className={styles.categoryBadge}>{item.category}</span>
                                    <h3 className={styles.cardTitle}>{item.name}</h3>
                                    <p className={styles.cardUnit}>기준: {item.standardUnit}</p>
                                </div>
                                <button 
                                    className={styles.deleteBtn}
                                    onClick={(e) => handleRemoveFavorite(e, item.favoriteId, item.name)}
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