import { useEffect } from "react";

export default function useCarrotCursor() {
    useEffect(() => {
        // 1. 당근 커서 생성
        const carrotCursor = document.createElement("div");
        carrotCursor.id = "carrot-cursor";
        carrotCursor.innerText = "🥕";
        document.body.appendChild(carrotCursor);

        // 2. 당근 커서 스타일 설정
        Object.assign(carrotCursor.style, {
            position: "fixed",
            left: "0px",
            top: "0px",
            fontSize: "34px",
            pointerEvents: "none",
            zIndex: "999999", // 당근이 제일 위
            userSelect: "none",
            transform: "translate(-70%, -40%) rotate(95deg)",
        });

        // 3. 기본 마우스 커서 숨기기
        const cursorStyle = document.createElement("style");
        cursorStyle.innerHTML = `
            * {
                cursor: none !important;
            }
        `;
        document.head.appendChild(cursorStyle);

        // 반짝이들을 담아둘 배열 (청소용)
        const sparkles = [];

        // 4. 통합된 마우스 움직임 이벤트 핸들러
        const moveCursor = (e) => {
            // [기능 1] 당근 위치 이동
            carrotCursor.style.left = `${e.clientX}px`;
            carrotCursor.style.top = `${e.clientY}px`;

            // [기능 2] 반짝이 생성
            if (Math.random() < 0.5) {
                const sparkle = document.createElement("div");
                sparkle.innerText = "✨";

                // 반짝이 스타일
                Object.assign(sparkle.style, {
                    position: "fixed",
                    left: `${e.clientX}px`,
                    top: `${e.clientY}px`,
                    fontSize: `${Math.random() * 10 + 10}px`, // 크기 10~20px 랜덤
                    pointerEvents: "none", // 클릭 방지 필수
                    zIndex: "999998", // 당근보다 한 단계 아래
                    opacity: "1",
                    userSelect: "none",
                });

                document.body.appendChild(sparkle);
                sparkles.push(sparkle);

                // 반짝이 애니메이션 (점점 투명해지면서 살짝 아래로 떨어짐)
                let opacity = 1;
                let topPosition = e.clientY;

                const fadeOut = setInterval(() => {
                    opacity -= 0.03; // 투명도 감소
                    topPosition += 1; // 아래로 1px씩 이동 (중력 효과)

                    sparkle.style.opacity = opacity;
                    sparkle.style.top = `${topPosition}px`;

                    // 완전히 투명해지면 삭제
                    if (opacity <= 0) {
                        clearInterval(fadeOut);
                        sparkle.remove();
                        // 배열에서 제거
                        const index = sparkles.indexOf(sparkle);
                        if (index > -1) sparkles.splice(index, 1);
                    }
                }, 20); // 0.03초마다 실행
            }
        };

        window.addEventListener("mousemove", moveCursor);

        // 5. 뒷정리 (컴포넌트 사라질 때)
        return () => {
            window.removeEventListener("mousemove", moveCursor);
            carrotCursor.remove();
            cursorStyle.remove();

            // 남아있는 반짝이들도 싹 지우기
            sparkles.forEach(s => s.remove());
        };
    }, []);
}