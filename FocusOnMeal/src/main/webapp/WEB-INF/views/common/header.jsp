<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<link rel="stylesheet" href="/resources/css/common/header.css">

<header class="header">
    <div class="header-inner">
        <!-- 로고 -->
        <div class="logo-area">
            <a href="http://localhost:5173/">
                <img src="/resources/images/headerLogo.png" alt="FocusOnMeal" class="logo-img" />
            </a>
        </div>

        <!-- 메뉴 -->
        <nav class="nav">
            <ul class="nav-menu">
                <li class="dropdown">
                    <a href="http://localhost:5173/ingredient/list">식자재</a>
                    <ul class="dropdown-menu">
                        <li><a href="http://localhost:5173/ingredient/list">식자재 목록</a></li>
                        <li><a href="http://localhost:5173/mypage/customIngredients">커스텀 식자재</a></li>
                    </ul>
                </li>
                <li><a href="/meal/mealAI">식단</a></li>
                <li><a href="http://localhost:5173/board/safety/list">안전정보</a></li>
                <li><a href="http://localhost:5173/board/notice/list">공지사항</a></li>
            </ul>
        </nav>

        <!-- 로그인 상태에 따라 헤더 변경 -->
        <div class="user-area" id="userArea">
            <!-- JavaScript로 동적으로 변경됩니다 -->
        </div>
    </div>
</header>

<script>
    // 로그인 상태 확인 및 UI 업데이트
    function updateHeaderUI() {
        const token = localStorage.getItem("token");
        const memberNickname = localStorage.getItem("memberNickname");
        const userArea = document.getElementById("userArea");

        console.log("[Header] 로그인 상태 확인:", { token, memberNickname });

        if (token) {
            // 로그인 상태
            console.log("[Header] 로그인 상태 - 닉네임:", memberNickname);
            userArea.innerHTML =
                '<span class="welcome">' + (memberNickname || '회원') + '님</span>' +
                '<a href="http://localhost:5173/mypage" class="mypage">마이페이지</a>' +
                '<span class="slash">/</span>' +
                '<a href="#" class="logout" onclick="handleLogout(event)">로그아웃</a>';
        } else {
            // 비로그인 상태
            console.log("[Header] 비로그인 상태");
            userArea.innerHTML =
                '<a href="http://localhost:5173/member/login" class="login">로그인</a>' +
                '<span class="slash">/</span>' +
                '<a href="http://localhost:5173/member/form" class="form">회원가입</a>';
        }
    }

    // 로그아웃 처리
    function handleLogout(event) {
        event.preventDefault();

        // localStorage 삭제
        localStorage.removeItem("token");
        localStorage.removeItem("memberId");
        localStorage.removeItem("memberName");
        localStorage.removeItem("memberNickname");
        localStorage.removeItem("adminYn");

        // UI 업데이트
        updateHeaderUI();

        // React 홈으로 이동
        window.location.href = "http://localhost:5173/";
    }

    // 페이지 로드 시 헤더 UI 업데이트
    document.addEventListener("DOMContentLoaded", function() {
        console.log("[Header] DOMContentLoaded 이벤트 발생");
        updateHeaderUI();
    });

    // 로그인 상태 변경 이벤트 리스너 (React와 동일)
    window.addEventListener("loginStateChange", function() {
        console.log("[Header] loginStateChange 이벤트 발생");
        updateHeaderUI();
    });

    // 즉시 실행 (스크립트 로드 시점에 DOM이 이미 준비되어 있을 수 있음)
    if (document.readyState === "loading") {
        console.log("[Header] DOM 로딩 중...");
    } else {
        console.log("[Header] DOM 이미 로드됨 - 즉시 업데이트");
        updateHeaderUI();
    }
</script>