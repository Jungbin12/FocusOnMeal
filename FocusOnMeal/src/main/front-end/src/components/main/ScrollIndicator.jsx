import { useState, useEffect, useRef, useCallback } from "react";

const useParallaxScroll = ({ containerRef, sections }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const rafIdRef = useRef(null);
    const isSnapingRef = useRef(false);
    const lastScrollTimeRef = useRef(Date.now());
    const lastScrollTopRef = useRef(0);

    /* 🎯 자동 스냅 함수 */
    const snapToSection = useCallback((targetSection) => {
        if (isSnapingRef.current) return;

        const container = containerRef.current;
        if (!container) return;

        isSnapingRef.current = true;
        setIsTransitioning(true);

        let targetScroll = 0;
        for (let i = 0; i < targetSection; i++) {
            targetScroll += window.innerHeight * sections[i].height;
        }

        container.scrollTo({
            top: targetScroll,
            behavior: "smooth",
        });

        setTimeout(() => {
            isSnapingRef.current = false;
            setIsTransitioning(false);
        }, 1200);
    }, [sections, containerRef]);

    /* 📌 스크롤 핸들러 (최적화) */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let ticking = false;

        const updateScroll = () => {
            const scrollTop = container.scrollTop;
            lastScrollTopRef.current = scrollTop;
            
            // 현재 섹션 계산
            let accumulatedHeight = 0;
            let currentSec = 0;
            for (let i = 0; i < sections.length; i++) {
                const sectionHeight = container.clientHeight * sections[i].height;
                if (scrollTop < accumulatedHeight + sectionHeight) {
                    currentSec = i;
                    break;
                }
                accumulatedHeight += sectionHeight;
            }
            setCurrentSection(currentSec);

            ticking = false;
        };

        const handleScroll = () => {
            lastScrollTimeRef.current = Date.now();
            
            if (!ticking) {
                rafIdRef.current = requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };

        // 🎯 휠 이벤트 - 부드럽고 자연스럽게 개선
        let wheelTimeout = null;
        let accumulatedDelta = 0;
        const WHEEL_THRESHOLD = 100;

        const handleWheel = (e) => {
            // ⭐ 첫 페이지에서는 자유 스크롤 허용 (패럴랙스 효과 활성화)
            if (currentSection === 0 && !isSnapingRef.current) {
                return;
            }

            // 2, 3페이지에서만 페이지 스냅 적용
            if (currentSection > 0) {
                e.preventDefault();
                
                if (isSnapingRef.current || isTransitioning) return;

                accumulatedDelta += e.deltaY;

                clearTimeout(wheelTimeout);
                wheelTimeout = setTimeout(() => {
                    accumulatedDelta = 0;
                }, 150);

                if (Math.abs(accumulatedDelta) >= WHEEL_THRESHOLD) {
                    if (accumulatedDelta > 0) {
                        // 아래로 스크롤
                        if (currentSection < sections.length - 1) {
                            snapToSection(currentSection + 1);
                        }
                    } else {
                        // 위로 스크롤
                        if (currentSection > 0) {
                            snapToSection(currentSection - 1);
                        }
                    }
                    accumulatedDelta = 0;
                }
            }
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("scroll", handleScroll);
            container.removeEventListener("wheel", handleWheel);
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            clearTimeout(wheelTimeout);
        };
    }, [sections, snapToSection, currentSection, isTransitioning, containerRef]);

    /* 🖼️ 1번째 섹션 패럴랙스 계산 - GPU 가속 */
    const getParallaxTransform = useCallback((speed, initialOffset = 0, shouldScale = false) => {
        // ⭐ 첫 페이지가 아니면 패럴랙스 효과 비활성화
        if (currentSection !== 0) {
            return {
                transform: shouldScale
                    ? `translate3d(0, ${initialOffset}px, 0) scale(1)`
                    : `translate3d(0, ${initialOffset}px, 0)`,
                opacity: 0,
                pointerEvents: 'none',
            };
        }

        const container = containerRef.current;
        if (!container) return {};

        const sectionTop = 0;
        const sectionHeight = container.clientHeight * sections[0].height;
        const localScroll = container.scrollTop - sectionTop;

        if (localScroll < 0) {
            return {
                transform: shouldScale
                    ? `translate3d(0, ${initialOffset}px, 0) scale(1)`
                    : `translate3d(0, ${initialOffset}px, 0)`,
                opacity: 1,
            };
        }

        if (localScroll > sectionHeight) {
            return {
                transform: shouldScale
                    ? `translate3d(0, ${-sectionHeight * speed + initialOffset}px, 0) scale(2)`
                    : `translate3d(0, ${-sectionHeight * speed + initialOffset}px, 0)`,
            };
        }

        const translateY = -localScroll * speed + initialOffset;

        if (shouldScale) {
            const scale = 1 + (localScroll / sectionHeight) * 1.0;
            return {
                transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                opacity: 1,
            };
        }

        return {
            transform: `translate3d(0, ${translateY}px, 0)`,
            opacity: 1,
        };
    }, [sections, currentSection, containerRef]);

    return {
        currentSection,
        isTransitioning,
        snapToSection,
        getParallaxTransform,
    };
};

export default useParallaxScroll;