import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/common/Footer.jsx";
import useParallaxScroll from "../../components/main/ScrollIndicator.jsx";
import ParallaxEffects from "../../components/main/ParallaxSection.jsx";
import ContentSections from "../../components/main/ContentSection";

const ParallaxPage = () => {
    const navigate = useNavigate();
    const [hoveredBox, setHoveredBox] = useState(null);
    const [staticLeaves, setStaticLeaves] = useState([]);
    const [cursorParticles, setCursorParticles] = useState([]);
    const [ingredientList, setIngredientList] = useState([]);

    const containerRef = useRef(null);

    const sections = [
        {
            id: 1,
            title: "Focus on Meal",
            subtitle: "예산은 가볍게, 식단은 완벽하게 AI로 완성하는 <br> 스마트한 식생활 관리 솔루션, FOM",
            bgColor: "linear-gradient(180deg, #38A7DF 0%, #6AB9E2 100%)",
            height: 1.5,
            hasParallax: true,
        },
        {
            id: 2,
            bgColor: "linear-gradient(180deg, #67932A 0%, #99A237 100%)",
            height: 1,
            hasParallax: false,
        },
        {
            id: 3,
            bgColor: "linear-gradient(180deg, #99A237 0%, #B6BE5C 100%)",
            height: 1,
            hasParallax: false,
        },
        {
            id: 4,
            bgColor: "#ffffff",
            height: "auto", // 푸터 높이에 맞춤
            hasParallax: false,
            isFooter: true,
        },
    ];

    // 스크롤 로직 훅
    const { currentSection, snapToSection, getParallaxTransform } = useParallaxScroll({
        containerRef,
        sections,
    });

    // 🥬 식재료 가격 데이터 API 호출
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get("/ingredient/api/list");
                const sorted = response.data
                    .filter(item => item.priceChangePercent !== null && item.priceChangePercent !== undefined)
                    .sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
                    .slice(0, 5);
                setIngredientList(sorted);
            } catch (error) {
                console.error("식재료 목록 조회 실패:", error);
            }
        };
        fetchIngredients();
    }, []);

    // 💚 첫 장 정적 나뭇잎
    useEffect(() => {
        const leafColors = ['#F1F7AD', '#B6BE5C', '#99A237'];

        const createStaticLeaves = () => {
            const leafCount = Math.floor(Math.random() * 4) + 4;
            const newLeaves = Array.from({ length: leafCount }, (_, i) => ({
                id: Date.now() + i,
                left: Math.random() * 25,
                top: 10 + Math.random() * 40,
                duration: 5 + Math.random() * 3,
                size: 6 + Math.random() * 4,
                rotation: -15 + Math.random() * 30,
                delay: i * 0.25,
                color: leafColors[Math.floor(Math.random() * leafColors.length)],
            }));
            setStaticLeaves(newLeaves);
        };

        if (currentSection === 0) {
            createStaticLeaves();
            const interval = setInterval(createStaticLeaves, 8000);
            return () => clearInterval(interval);
        }
    }, [currentSection]);

    // 🥕 커스텀 당근 커서
    useEffect(() => {
        const carrotCursor = document.createElement("div");
        carrotCursor.id = "carrot-cursor";
        carrotCursor.innerText = "🥕";
        document.body.appendChild(carrotCursor);

        Object.assign(carrotCursor.style, {
            position: "fixed",
            left: "0px",
            top: "0px",
            fontSize: "34px",
            pointerEvents: "none",
            zIndex: "999999",
            userSelect: "none",
            transform: "translate(-70%, -40%) rotate(95deg)",
        });

        const moveCursor = (e) => {
            carrotCursor.style.left = `${e.clientX}px`;
            carrotCursor.style.top = `${e.clientY}px`;
        };

        window.addEventListener("mousemove", moveCursor);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            carrotCursor.remove();
        };
    }, []);

    return (
        <>
            <style>
                {`
                body, html {
                    cursor: none !important;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }

                * {
                    box-sizing: border-box;
                }

                @keyframes cursorFade {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
                }

                @keyframes flyLeafSlow {
                    0% { opacity: 0; left: -10%; top: var(--start-top); }
                    10% { opacity: 1; }
                    100% {
                        opacity: 0;
                        left: 110%;
                        top: calc(var(--start-top) + 40vh);
                    }
                }

                @keyframes chatPopup {
                    0% { opacity: 0; transform: translateY(10px) scale(0.9); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }

                ::-webkit-scrollbar { display: none; }
                `}
            </style>

            {/* ✨ 커서 파티클 */}
            {cursorParticles.map((p) => (
                <div
                    key={p.id}
                    style={{
                        position: "fixed",
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        background: "rgba(255,255,255,0.9)",
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        filter: "blur(2px)",
                        pointerEvents: "none",
                        animation: `cursorFade ${p.lifespan}ms ease-out forwards`,
                        zIndex: 9999,
                    }}
                />
            ))}

            {/* 전체 레이아웃 컨테이너 */}
            <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
                <div
                    ref={containerRef}
                    style={{
                        width: "100%",
                        height: "100vh",
                        overflowY: "scroll",
                        scrollSnapType: "none",
                        scrollBehavior: "auto",
                    }}
                >
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            style={{
                                width: "100%",
                                height: section.height === "auto" ? "auto" : `${section.height * 100}vh`,
                                minHeight: section.height === "auto" ? "auto" : `${section.height * 100}vh`,
                                scrollSnapAlign: index < 3 ? "start" : "none",
                                background: section.bgColor,
                                position: "relative",
                                overflow: index === 0 ? "hidden" : "visible",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: section.isFooter ? "flex-start" : "flex-start",
                                alignItems: section.isFooter ? "stretch" : "stretch",
                            }}
                        >
                            {/* 🌿 첫 화면 나뭇잎 */}
                            {index === 0 && staticLeaves.map((leaf) => (
                                <div
                                    key={leaf.id}
                                    style={{
                                        position: "absolute",
                                        left: `${leaf.left}%`,
                                        top: `${leaf.top}%`,
                                        width: `${leaf.size * 2}px`,
                                        height: `${leaf.size}px`,
                                        '--start-top': `${leaf.top}%`,
                                        background: leaf.color,
                                        borderRadius: "50%",
                                        transform: `rotate(${leaf.rotation}deg)`,
                                        animation: `flyLeafSlow ${leaf.duration}s ease-in-out forwards`,
                                        animationDelay: `${leaf.delay}s`,
                                        pointerEvents: "none",
                                        zIndex: 500,
                                        willChange: "transform, opacity",
                                    }}
                                />
                            ))}

                            {/* 첫 화면 텍스트 */}
                            {index === 0 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "30%",
                                        left: "10%",
                                        textAlign: "left",
                                        color: "white",
                                        zIndex: 10,
                                    }}
                                >
                                    <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>{section.title}</h1>
                                    <p 
                                        style={{ fontSize: "20px" }} 
                                        dangerouslySetInnerHTML={{ __html: section.subtitle }} 
                                    />
                                </div>
                            )}

                            {/* ⭐ 1번째 페이지 패럴랙스 이미지 */}
                            {index === 0 && section.hasParallax && (
                                <ParallaxEffects 
                                    getParallaxTransform={getParallaxTransform}
                                    currentSection={currentSection}
                                />
                            )}

                            {/* 2, 3페이지 콘텐츠 */}
                            {(index === 1 || index === 2) && (
                                <>
                                    <ContentSections
                                        index={index}
                                        hoveredBox={hoveredBox}
                                        setHoveredBox={setHoveredBox}
                                        ingredientList={ingredientList}
                                        navigate={navigate}
                                    />
                                    {/* 3페이지에만 푸터 추가 */}
                                    {index === 2 && (
                                        <div style={{ 
                                            marginTop: "auto",
                                            width: "100%",
                                        }}>
                                            <Footer />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* 🔘 스크롤 인디케이터 - 푸터 제외 */}
                <div
                    style={{
                        position: "fixed",
                        right: "30px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 2000,
                    }}
                >
                    {sections.filter(s => !s.isFooter).map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: "12px",
                                height: "12px",
                                margin: "10px 0",
                                borderRadius: "50%",
                                background:
                                    currentSection === index
                                        ? "white"
                                        : "rgba(255,255,255,0.3)",
                                cursor: "pointer",
                                transition: "0.3s",
                            }}
                            onClick={() => snapToSection(index)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default ParallaxPage;