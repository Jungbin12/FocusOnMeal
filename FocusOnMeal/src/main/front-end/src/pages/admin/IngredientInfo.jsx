import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from "./IngredientInfo.module.css";

// [중요] 작성하신 Modal 컴포넌트 경로를 맞춰주세요
import Modal from "../../components/Modal"; 
import Sidebar from "../../components/admin/Sidebar";
import Pagination from "../../components/common/Pagination";

// 자주 쓰이는 카테고리 목록
const CATEGORIES = [
    "식량작물", "채소류", "과일류", "육류", "수산물", "가공식품", "난류", "우유/유제품", "기타"
];

const IngredientInfo = () => {
    const navigate = useNavigate();

    const [ingredientList, setIngredientList] = useState([]);
    
    // 페이지네이션 상태
    const [pageInfo, setPageInfo] = useState({ maxPage: 1, totalCount: 0 });
    const [currentPage, setCurrentPage] = useState(1);

    // 검색 상태 (API 요청용 / UI 입력용 분리)
    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    
    // 정렬 상태
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");

    // 카테고리 필터 팝업 상태
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const categoryFilterRef = useRef(null);
    
    // 이미지 새로고침용 키
    const [imgRefreshKey, setImgRefreshKey] = useState(Date.now());
    
    // 이미지 미리보기 모달 상태
    const [previewImage, setPreviewImage] = useState(null);

    // [영양성분 수정 모달 상태]
    const [showNutritionModal, setShowNutritionModal] = useState(false);
    const [nutritionForm, setNutritionForm] = useState({
        ingredientId: '',
        name: '',
        category: '', // 화면 표시용
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        sugar: 0
    });

    // 외부 클릭 시 카테고리 필터 닫기
    useEffect(() => {
        function handleClickOutside(event) {
            if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target)) {
                setShowCategoryFilter(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [categoryFilterRef]);

    // 검색 실행
    const handleSearch = () => {
        setCurrentPage(1);
        setFetchSearchType(searchType);
        setFetchSearchKeyword(searchKeyword);
        setSortColumn(null);
        setSortOrder('asc');
    };

    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // 카테고리 선택 필터링
    const handleCategoryFilter = (selectedCategory) => {
        setCurrentPage(1);
        setFetchSearchType('categoryName');
        setFetchSearchKeyword(selectedCategory);
        setSearchKeyword(''); 
        setShowCategoryFilter(false);
    };

    // 정렬 핸들러
    const handleSort = (column) => {
        if (sortColumn !== column) {
            setSortColumn(column);
            setSortOrder("asc");
        } else {
            if (sortOrder === "asc") {
                setSortOrder("desc");
            } else if (sortOrder === "desc") {
                setSortColumn(null);
                setSortOrder("asc");
            }
        }
    };
    
    // 이미지 업로드
    const handleImageUpload = async (ingredientId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("ingredientId", ingredientId);
        formData.append("file", file);
        try {
            await axios.post("/api/admin/ingredient/image", formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                }
            });
            alert("이미지가 변경되었습니다.");
            setImgRefreshKey(Date.now());
        } catch (err) {
            console.error(err);
            alert("이미지 업로드 실패");
        }
    };

    // 이미지 삭제
    const handleImageDelete = async (ingredientId) => {
        if (!window.confirm("등록된 이미지를 삭제하시겠습니까? \n(기본 이미지로 변경됩니다)")) return;

        try {
            await axios.delete(`/api/admin/ingredient/image/${ingredientId}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
            });
            
            alert("이미지가 삭제되었습니다.");
            setImgRefreshKey(Date.now()); 
        } catch (err) {
            console.error(err);
            alert("이미지 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleImageClick = (src) => {
        if (src.includes('default_ingredient.png')) return;
        setPreviewImage(src);
    };

    const handleImageError = (e) => {
        e.target.src = '/images/default_ingredient.png';
        e.target.onclick = null;
        e.target.style.cursor = 'default';
    };

    // 상세 페이지 이동
    const handleMoveToDetail = (ingredientId) => {
        navigate(`/admin/ingredient/detail/${ingredientId}`);
    };

    // [영양성분 수정 버튼 클릭]
    const handleNutritionEdit = (item) => {
        setNutritionForm({
            ingredientId: item.ingredientId,
            name: item.name,
            category: item.category || '-',
            calories: item.calories || 0,
            carbs: item.carbs || 0,
            protein: item.protein || 0,
            fat: item.fat || 0,
            sugar: item.sugar || 0
        });
        setShowNutritionModal(true);
    };

    // 영양성분 입력값 변경
    const handleNutritionChange = (e) => {
        const { name, value } = e.target;
        // 숫자로 변환하여 저장 (차트 계산을 위해)
        setNutritionForm(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    // [추가] 마우스 휠로 숫자 변경 방지 핸들러
    const handleWheel = (e) => {
        e.target.blur();
    };

    // 영양성분 저장 요청
    const handleNutritionUpdate = async () => {
        if (!window.confirm(`${nutritionForm.name}의 영양성분을 수정하시겠습니까?`)) return;

        try {
            await axios.put("/api/admin/ingredient/nutrition", nutritionForm, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
            });
            
            alert("영양성분이 수정되었습니다.");
            setShowNutritionModal(false);
            fetchIngredientList(); 
        } catch (err) {
            console.error(err);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    // 목록 조회 API
    const fetchIngredientList = () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const params = {
            page: currentPage,
            type: fetchSearchType,
            keyword: fetchSearchKeyword,
            sortColumn,
            sortOrder
        };
        if (!params.keyword) params.type = 'all';

        axios.get("/api/admin/ingredient", {
            params: params,
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setIngredientList(res.data.ingredientList);
            setPageInfo(res.data.pageInfo);
        })
        .catch(err => console.error("API Error:", err));
    };

    useEffect(() => {
        fetchIngredientList();
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn, sortOrder]);

    const renderSortArrow = (column) => {
        if (sortColumn !== column) return <span className={styles.sortArrow}>↕</span>;
        return (
            <span className={`${styles.sortArrow} ${styles.activeSort}`}>
                {sortOrder === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    // --- [도넛 차트 계산 로직] ---
    // 탄수화물(Yellow), 단백질(Green), 지방(Orange)
    const totalNutrients = (nutritionForm.carbs || 0) + (nutritionForm.protein || 0) + (nutritionForm.fat || 0);
    
    // 각 성분의 퍼센트 계산
    const pCarbs = totalNutrients === 0 ? 0 : ((nutritionForm.carbs / totalNutrients) * 100);
    const pProtein = totalNutrients === 0 ? 0 : ((nutritionForm.protein / totalNutrients) * 100);
    const pFat = totalNutrients === 0 ? 0 : ((nutritionForm.fat / totalNutrients) * 100);

    // 차트 각도 계산 (순서: 단백질 -> 지방 -> 탄수화물)
    const degProtein = pProtein; 
    const degFat = degProtein + pFat; 
    
    const chartBackground = totalNutrients === 0 
        ? '#eee' 
        : `conic-gradient(
            #00C896 0% ${degProtein}%, 
            #FF7F50 ${degProtein}% ${degFat}%, 
            #FFC107 ${degFat}% 100%
          )`;

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <div className={styles.titleRow}>
                    <h2 className={styles.title}>식재료 관리</h2>
                    <span className={styles.totalCount}>
                        (총 <span className={styles.countNumber}>
                            {(pageInfo?.totalCount || 0).toLocaleString()}
                        </span>건)
                    </span>
                </div>
                
                <div className={styles.searchBox}>
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className={styles.selectBox}
                    >
                        <option value="all">전체</option>
                        <option value="ingredientName">재료명</option>
                    </select>

                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        onKeyDown={handleSearchOnEnter}
                        className={styles.searchInput}
                    />

                    <button onClick={handleSearch} className={styles.searchBtn}>
                        검색
                    </button>
                </div>
                
                <table className={styles.memberTable}>
                    <thead>
                        <tr>
                            <th className={styles.noCol} onClick={() => handleSort("ingredientId")} style={{cursor: 'pointer'}}>
                                No {renderSortArrow("ingredientId")}
                            </th>
                            
                            <th className={styles.imageCol}>이미지</th>

                            <th className={styles.categoryCol}>
                                <div className={styles.thWrapper} ref={categoryFilterRef}>
                                    <div 
                                        className={styles.headerContent}
                                        onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                                    >
                                        카테고리 
                                        <span style={{marginLeft: '4px', fontSize: '12px'}}>
                                            {fetchSearchType === 'categoryName' && fetchSearchKeyword ? '▼' : '▽'}
                                        </span>
                                    </div>

                                    {showCategoryFilter && (
                                        <div className={styles.filterDropdown}>
                                            <div 
                                                className={styles.filterItem}
                                                onClick={() => {
                                                    handleSearch(); 
                                                    setFetchSearchType('all');
                                                    setFetchSearchKeyword('');
                                                    setSearchKeyword('');
                                                    setShowCategoryFilter(false);
                                                }}
                                            >
                                                전체 보기
                                            </div>
                                            {CATEGORIES.map(cat => (
                                                <div 
                                                    key={cat} 
                                                    className={styles.filterItem}
                                                    onClick={() => handleCategoryFilter(cat)}
                                                >
                                                    {cat}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </th>

                            <th className={styles.ingredientNameCol} onClick={() => handleSort("name")} style={{cursor: 'pointer'}}>
                                재료명 {renderSortArrow("name")}
                            </th>

                            <th className={styles.unitCol} onClick={() => handleSort("standardUnit")} style={{cursor: 'pointer'}}>
                                기준단위 {renderSortArrow("standardUnit")}
                            </th>

                            <th className={styles.priceCol} onClick={() => handleSort("currentPrice")} style={{cursor: 'pointer'}}>
                                현재가격 {renderSortArrow("currentPrice")}
                            </th>

                            <th className={styles.priceCol} onClick={() => handleSort("previousPrice")} style={{cursor: 'pointer'}}>
                                이전가격 {renderSortArrow("previousPrice")}
                            </th>

                            <th className={styles.dateCol} onClick={() => handleSort("collectedDate")} style={{cursor: 'pointer'}}>
                                최근 수집일 {renderSortArrow("collectedDate")}
                            </th>

                            <th className={styles.nutritionCol}>영양성분</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ingredientList?.length === 0 ? (
                            <tr>
                                <td colSpan="9" className={styles.emptyCell}>
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            ingredientList.map((item) => (
                                <tr key={item.ingredientId}>
                                    <td>{item.ingredientId}</td>
                                    
                                    <td>
                                        <div className={styles.imageWrapper}>
                                            <img 
                                                src={`/images/ingredients/${item.ingredientId}.jpg?t=${imgRefreshKey}`} 
                                                alt={item.name || 'ingredient'} 
                                                className={styles.ingredientImage}
                                                onError={handleImageError}
                                                onClick={(e) => handleImageClick(e.target.src)}
                                            />
                                            <div style={{display:'flex', alignItems:'center'}}>
                                                <label className={styles.imageChangeLabel}>
                                                    [변경]
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        className={styles.fileInput}
                                                        onChange={(e) => handleImageUpload(item.ingredientId, e.target.files[0])}
                                                    />
                                                </label>
                                                <button 
                                                    className={styles.deleteBtn} 
                                                    onClick={() => handleImageDelete(item.ingredientId)}
                                                >
                                                    [삭제]
                                                </button>
                                            </div>
                                        </div>
                                    </td>

                                    <td>{item.category || '-'}</td>

                                    <td className={styles.nameCell}>
                                        <div className={styles.textWrapper}>
                                            <span 
                                                className={`${styles.truncatedText} ${styles.clickableName}`}
                                                onClick={() => handleMoveToDetail(item.ingredientId)}
                                            >
                                                {item.name || '-'}
                                            </span>
                                            <div className={styles.tooltip}>
                                                {item.name || '-'}
                                            </div>
                                        </div>
                                    </td>

                                    <td>1{item.standardUnit || '1kg'}</td>
                                    
                                    <td>
                                        {item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : '-'}
                                        {item.collectedDate && (
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                ({new Date(item.collectedDate).toLocaleDateString("ko-KR")})
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td>
                                        {item.previousPrice ? `${item.previousPrice.toLocaleString()}원` : '-'}
                                        {item.previousCollectedDate && (
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                ({new Date(item.previousCollectedDate).toLocaleDateString("ko-KR")})
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td>
                                        {item.collectedDate ? 
                                            new Date(item.collectedDate).toLocaleString("ko-KR", {
                                                year: 'numeric', 
                                                month: '2-digit', 
                                                day: '2-digit', 
                                                hour: '2-digit', 
                                                minute: '2-digit'
                                            }) : 
                                       item.enrollDate ? 
                                            new Date(item.enrollDate).toLocaleString("ko-KR", {
                                                year: 'numeric', 
                                                month: '2-digit', 
                                                day: '2-digit', 
                                                hour: '2-digit', 
                                                minute: '2-digit'
                                            }) : "-"}
                                    </td>

                                    <td>
                                        <button 
                                            className={styles.editBtn}
                                            onClick={() => handleNutritionEdit(item)}
                                        >
                                            [수정]
                                        </button>
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
            </main>

            {/* 이미지 미리보기 모달 */}
            {previewImage && (
                <div className={styles.modalOverlay} onClick={() => setPreviewImage(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setPreviewImage(null)}>
                            &times;
                        </button>
                        <img src={previewImage} alt="확대 보기" className={styles.modalImage} />
                    </div>
                </div>
            )}

            {/* [수정] 영양성분 수정 모달 (2단 레이아웃 + 도넛 차트) */}
            <Modal
                isOpen={showNutritionModal}
                onClose={() => setShowNutritionModal(false)}
                // title에 문자열 대신 JSX를 전달
                title={
                    <span>
                        영양성분 수정
                        <span style={{ fontSize: '14px', color: '#999', marginLeft: '6px', fontWeight: 'normal' }}>
                            (100g 기준)
                        </span>
                    </span>
                }
            >
                <div className={styles.nutritionModalInner}>
                    
                    {/* [왼쪽] 차트 및 정보 영역 */}
                    <div className={styles.chartSection}>
                        <div className={styles.chartInfoSummary}>
                            <div className={styles.chartInfoTitle}>{nutritionForm.name}</div>
                            <div className={styles.chartInfoCategory}>{nutritionForm.category}</div>
                        </div>

                        {/* 도넛 차트 */}
                        <div className={styles.donutChartWrapper}>
                            <div 
                                className={styles.donutChart} 
                                style={{ background: chartBackground }}
                            >
                                <div className={styles.donutHole}>
                                    <div className={styles.chartTotalLabel}>
                                        {totalNutrients === 0 ? '0kcal' : `${nutritionForm.calories}kcal`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 범례 */}
                        <div className={styles.chartLegend}>
                            <div className={styles.legendItem}>
                                <span className={styles.legendColor} style={{background: '#00C896'}}></span>
                                <span>단백질</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendColor} style={{background: '#FF7F50'}}></span>
                                <span>지방</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendColor} style={{background: '#FFC107'}}></span>
                                <span>탄수화물</span>
                            </div>
                        </div>
                    </div>

                    {/* [오른쪽] 입력 폼 영역 (onWheel 추가됨) */}
                    <div className={styles.formSection}>
                        <div className={styles.verticalForm}>
                            <div className={styles.formGroupRow}>
                                <label>열량 (kcal)</label>
                                <input 
                                    type="number" 
                                    name="calories" 
                                    value={nutritionForm.calories} 
                                    onChange={handleNutritionChange} 
                                    onWheel={handleWheel}
                                    placeholder="0" 
                                />
                            </div>
                            <div className={styles.formGroupRow}>
                                <label>탄수화물 (g)</label>
                                <input 
                                    type="number" 
                                    name="carbs" 
                                    value={nutritionForm.carbs} 
                                    onChange={handleNutritionChange}
                                    onWheel={handleWheel} 
                                    placeholder="0" 
                                />
                            </div>
                            <div className={styles.formGroupRow}>
                                <label>단백질 (g)</label>
                                <input 
                                    type="number" 
                                    name="protein" 
                                    value={nutritionForm.protein} 
                                    onChange={handleNutritionChange} 
                                    onWheel={handleWheel}
                                    placeholder="0" 
                                />
                            </div>
                            <div className={styles.formGroupRow}>
                                <label>지방 (g)</label>
                                <input 
                                    type="number" 
                                    name="fat" 
                                    value={nutritionForm.fat} 
                                    onChange={handleNutritionChange} 
                                    onWheel={handleWheel}
                                    placeholder="0" 
                                />
                            </div>
                            <div className={styles.formGroupRow}>
                                <label>당류 (g)</label>
                                <input 
                                    type="number" 
                                    name="sugar" 
                                    value={nutritionForm.sugar} 
                                    onChange={handleNutritionChange} 
                                    onWheel={handleWheel}
                                    placeholder="0" 
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowNutritionModal(false)}>취소</button>
                            <button className={styles.saveBtn} onClick={handleNutritionUpdate}>저장하기</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default IngredientInfo;