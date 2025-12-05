import React from "react";
import cloudImg from "../../assets/parallax/cloudzip.png";
import mountainImg from "../../assets/parallax/mountainzip.png";
import cornImg from "../../assets/parallax/cornfieldzip.png";
import grassImg from "../../assets/parallax/grasszip.png";
import bushImg from "../../assets/parallax/bushzip.png";

const ParallaxEffects = ({ getParallaxTransform, currentSection }) => {

    const parallaxActive = currentSection === 0;

    return (
        <>
            {/* 🎨 배경 하단 진한 초록색 레이어 */}
            <div
                style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    height: "45%",
                    background: "linear-gradient(180deg, transparent 0%, #0A3A2B 50%, #1a2e12 100%)",
                    zIndex: 0,
                }}
            />

            {/* ☁ 구름 - 가장 느리게 */}
            <img
                src={cloudImg}
                alt="cloud"
                style={{
                    position: "absolute",
                    top: "-5%",
                    left: "0",
                    width: "100%",
                    height: "auto",
                    minHeight: "120vh",
                    objectFit: "cover",
                    ...getParallaxTransform(0.2, 100, false),
                    zIndex: 1,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* 🏔 산 - 중간 속도 */}
            <img
                src={mountainImg}
                alt="mountain"
                style={{
                    position: "absolute",
                    top: "-3%",
                    left: "0",
                    width: "100%",
                    height: "auto",
                    minHeight: "120vh",
                    objectFit: "cover",
                    ...getParallaxTransform(0.45, 250, false),
                    zIndex: 2,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* 🌾 밀밭 - 빠른 속도 */}
            <img
                src={cornImg}
                alt="cornfield"
                style={{
                    position: "absolute",
                    top: "-3%",
                    left: "0",
                    width: "100%",
                    height: "auto",
                    minHeight: "120vh",
                    objectFit: "cover",
                    ...getParallaxTransform(0.7, 350, false),
                    zIndex: 3,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* 🌱 잔디 - 매우 빠른 속도 */}
            <img
                src={grassImg}
                alt="grass"
                style={{
                    position: "absolute",
                    top: "-3%",
                    left: "0",
                    width: "100%",
                    height: "auto",
                    minHeight: "120vh",
                    objectFit: "cover",
                    ...getParallaxTransform(0.9, 450, false),
                    zIndex: 4,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* 🌿 수풀 - 가장 빠르게 + 확대 효과 */}
            <img
                src={bushImg}
                alt="bush"
                style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    height: "auto",
                    minHeight: "100vh",
                    objectFit: "cover",
                    transformOrigin: "center bottom",
                    ...getParallaxTransform(1.0, 550, true),
                    zIndex: 5,
                    transition: 'opacity 0.3s ease, transform 0.1s ease-out',
                }}
            />
        </>
    );
};

export default ParallaxEffects;