import React from "react";

const ContentSections = ({ index, hoveredBox, setHoveredBox, ingredientList, navigate }) => {
    // 2페이지 콘텐츠
    if (index === 1) {
        return (
            <div
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            >
                <div style={{
                    width: "90%",
                    maxWidth: "1400px",
                    display: "flex",
                    gap: "40px",
                    alignItems: "flex-start",
                }}>
                    {/* 왼쪽: AI 식단 추천 홍보 */}
                    <div
                        onClick={() => navigate("/meal/mealAI")}
                        onMouseEnter={() => setHoveredBox('ai')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                            flex: 1,
                            background: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "20px",
                            padding: "40px",
                            position: "relative",
                            cursor: "pointer",
                            boxShadow: hoveredBox === 'ai'
                                ? "0 20px 60px rgba(103, 147, 42, 0.4)"
                                : "0 10px 30px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                            transform: hoveredBox === 'ai' ? "scale(1.02)" : "scale(1)",
                            pointerEvents: "auto",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-30px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                fontSize: "60px",
                            }}
                        >
                            🍽️
                        </div>

                        <h2
                            style={{
                                fontSize: "32px",
                                fontWeight: "bold",
                                color: "#67932A",
                                marginTop: "40px",
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            AI 식단 추천
                        </h2>

                        <p
                            style={{
                                fontSize: "18px",
                                color: "#666",
                                textAlign: "center",
                                lineHeight: "1.6",
                            }}
                        >
                            나만의 맞춤형 식단을<br />
                            AI가 추천해드립니다
                        </p>

                        <div
                            style={{
                                marginTop: "30px",
                                padding: "20px",
                                background: "#f1f7e6",
                                borderRadius: "10px",
                                border: "2px solid #c5d89d",
                            }}
                        >
                            <p style={{ fontSize: "16px", color: "#67932A", margin: 0, textAlign: "center" }}>
                                ✨ 클릭하여 시작하기
                            </p>
                        </div>

                        {hoveredBox === 'ai' && (
                            <div style={{ marginTop: "20px", position: "relative" }}>
                                <div
                                    style={{
                                        background: "#f1f7ad",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        marginBottom: "8px",
                                        animation: "chatPopup 0.3s ease-out",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#333" }}>
                                        🥗 건강한 식단 추천받기
                                    </p>
                                </div>
                                <div
                                    style={{
                                        background: "#b6be5c",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        marginBottom: "8px",
                                        animation: "chatPopup 0.3s ease-out",
                                        animationDelay: "0.1s",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                        💰 예산에 맞는 식단 구성
                                    </p>
                                </div>
                                <div
                                    style={{
                                        background: "#99a237",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        animation: "chatPopup 0.3s ease-out",
                                        animationDelay: "0.2s",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                        📊 영양 성분 자동 계산
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 오른쪽: 오늘의 식재료 가격 */}
                    <div
                        onMouseEnter={() => setHoveredBox('price')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                            flex: 1,
                            background: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "20px",
                            padding: "40px",
                            position: "relative",
                            boxShadow: hoveredBox === 'price'
                                ? "0 20px 60px rgba(103, 147, 42, 0.4)"
                                : "0 10px 30px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                            transform: hoveredBox === 'price' ? "scale(1.02)" : "scale(1)",
                            display: "flex",
                            flexDirection: "column",
                            pointerEvents: "auto",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-30px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                fontSize: "60px",
                            }}
                        >
                            📈
                        </div>

                        <h2 style={{
                            fontSize: "28px",
                            color: "#67932A",
                            textAlign: "center",
                            marginTop: "30px",
                            marginBottom: "20px",
                            fontWeight: "bold",
                        }}>
                            오늘의 식재료 가격
                        </h2>

                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            flex: 1,
                        }}>
                            {ingredientList.map((item) => (
                                <div
                                    key={item.ingredientId}
                                    onClick={() => navigate(`/ingredient/detail/${item.ingredientId}`)}
                                    style={{
                                        background: "#f1f7e6",
                                        borderRadius: "12px",
                                        padding: "14px 20px",
                                        border: "1px solid #c5d89d",
                                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateX(5px)";
                                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(103, 147, 42, 0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateX(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 ,}}>
                                        <div style={{
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                            color: "#67932A",
                                            minWidth: "60px",
                                        }}>
                                            {item.name}
                                        </div>
                                        <div style={{
                                            fontSize: "11px",
                                            color: "#67932A",
                                            padding: "2px 8px",
                                            background: "rgba(103, 147, 42, 0.15)",
                                            borderRadius: "15px",
                                        }}>
                                            {item.standardUnit || "1kg"}
                                        </div>
                                    </div>

                                    <div style={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        color: "#333",
                                        minWidth: "100px",
                                        textAlign: "center",
                                    }}>
                                        {item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : "-"}
                                    </div>

                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        minWidth: "90px",
                                        justifyContent: "flex-end",
                                    }}>
                                        <span style={{
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            color: item.priceChangePercent > 0 ? "#d32f2f" : "#1976d2",
                                        }}>
                                            {item.priceChangePercent > 0 ? "▲" : "▼"}
                                        </span>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                            <span style={{
                                                fontSize: "14px",
                                                fontWeight: "bold",
                                                color: item.priceChangePercent > 0 ? "#d32f2f" : "#1976d2",
                                            }}>
                                                {item.priceChangePercent > 0 ? "+" : ""}{item.priceChangePercent?.toFixed(1)}%
                                            </span>
                                            <span style={{
                                                fontSize: "9px",
                                                color: "#999",
                                            }}>
                                                전일 대비
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "20px",
                        }}>
                            <button
                                onClick={() => navigate("/ingredient/list")}
                                style={{
                                    padding: "12px 30px",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: "white",
                                    background: "linear-gradient(135deg, #67932A 0%, #99A237 100%)",
                                    border: "none",
                                    borderRadius: "25px",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 15px rgba(103, 147, 42, 0.3)",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(103, 147, 42, 0.5)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(103, 147, 42, 0.3)";
                                }}
                            >
                                더 많은 식재료 보기 →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3페이지 콘텐츠
    if (index === 2) {
        return (
            <div
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            >
                <div style={{
                    width: "90%",
                    maxWidth: "1400px",
                    display: "flex",
                    gap: "40px",
                    alignItems: "flex-start",
                }}>
                    {/* 위해 식품 정보 박스 */}
                    <div
                        onClick={() => navigate("/board/safety/list")}
                        onMouseEnter={() => setHoveredBox('warning')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                            flex: 1,
                            background: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "20px",
                            padding: "40px",
                            position: "relative",
                            cursor: "pointer",
                            boxShadow: hoveredBox === 'warning'
                                ? "0 20px 60px rgba(211, 47, 47, 0.4)"
                                : "0 10px 30px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                            transform: hoveredBox === 'warning' ? "scale(1.02)" : "scale(1)",
                            pointerEvents: "auto",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-30px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                fontSize: "60px",
                            }}
                        >
                            🚨
                        </div>

                        <h2
                            style={{
                                fontSize: "32px",
                                fontWeight: "bold",
                                color: "#d32f2f",
                                marginTop: "40px",
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            위해 식품 정보
                        </h2>

                        <p
                            style={{
                                fontSize: "18px",
                                color: "#666",
                                textAlign: "center",
                                lineHeight: "1.6",
                            }}
                        >
                            최신 위해 식품 정보를 확인하고<br />
                            안전한 식생활을 유지하세요
                        </p>

                        <div
                            style={{
                                marginTop: "30px",
                                padding: "20px",
                                background: "#fff3f3",
                                borderRadius: "10px",
                                border: "2px solid #ffcdd2",
                            }}
                        >
                            <p style={{ fontSize: "16px", color: "#d32f2f", margin: 0, textAlign: "center" }}>
                                ⚠️ 클릭하여 확인하기
                            </p>
                        </div>

                        {hoveredBox === 'warning' && (
                            <div style={{ marginTop: "20px", position: "relative" }}>
                                <div
                                    style={{
                                        background: "#ffebee",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        marginBottom: "8px",
                                        animation: "chatPopup 0.3s ease-out",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#333" }}>
                                        🔍 리콜 식품 정보 확인
                                    </p>
                                </div>
                                <div
                                    style={{
                                        background: "#ef9a9a",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        marginBottom: "8px",
                                        animation: "chatPopup 0.3s ease-out",
                                        animationDelay: "0.1s",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                        📋 부적합 식품 목록 조회
                                    </p>
                                </div>
                                <div
                                    style={{
                                        background: "#d32f2f",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        animation: "chatPopup 0.3s ease-out",
                                        animationDelay: "0.2s",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                        🛡️ 안전 알림 설정하기
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 공지사항 박스 */}
                    <div
                        onClick={() => navigate("/board/notice/list")}
                        onMouseEnter={() => setHoveredBox('notice')}
                        onMouseLeave={() => setHoveredBox(null)}
                        style={{
                            flex: 1,
                            background: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "20px",
                            padding: "40px",
                            position: "relative",
                            cursor: "pointer",
                            boxShadow: hoveredBox === 'notice'
                                ? "0 20px 60px rgba(103, 147, 42, 0.4)"
                                : "0 10px 30px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                            transform: hoveredBox === 'notice' ? "scale(1.02)" : "scale(1)",
                            pointerEvents: "auto",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-30px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                fontSize: "60px",
                            }}
                        >
                            📢
                        </div>

                        <h2
                            style={{
                                fontSize: "32px",
                                fontWeight: "bold",
                                color: "#67932A",
                                marginTop: "40px",
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            공지사항
                        </h2>

                        <p
                            style={{
                                fontSize: "18px",
                                color: "#666",
                                textAlign: "center",
                                lineHeight: "1.6",
                            }}
                        >
                            새로운 소식과 업데이트를<br />
                            확인해보세요
                        </p>

                        <div
                            style={{
                                marginTop: "30px",
                                padding: "20px",
                                background: "#f1f7e6",
                                borderRadius: "10px",
                                border: "2px solid #c5d89d",
                            }}
                        >
                            <p style={{ fontSize: "16px", color: "#67932A", margin: 0, textAlign: "center" }}>
                                ✨ 클릭하여 확인하기
                            </p>
                        </div>

                        {hoveredBox === 'notice' && (
                            <div style={{ marginTop: "20px", position: "relative" }}>
                                <div
                                    style={{
                                        background: "#f1f7ad",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        marginBottom: "8px",
                                        animation: "chatPopup 0.3s ease-out",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#333" }}>
                                        🎉 새로운 기능 업데이트
                                    </p>
                                </div>
                                <div
                                    style={{
                                        background: "#b6be5c",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        marginBottom: "8px",
                                        animation: "chatPopup 0.3s ease-out",
                                        animationDelay: "0.1s",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                        📅 서비스 점검 안내
                                    </p>
                                </div>
                                <div
                                    style={{
                                        background: "#99a237",
                                        padding: "12px 16px",
                                        borderRadius: "15px 15px 15px 0",
                                        animation: "chatPopup 0.3s ease-out",
                                        animationDelay: "0.2s",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: "13px", color: "#fff" }}>
                                        📣 이벤트 소식 확인
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default ContentSections;