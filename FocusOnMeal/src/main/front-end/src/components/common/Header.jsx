import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";
import logo from "../../../../webapp/resources/images/headerLogo.png";
import { Bell } from "lucide-react";

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [memberNickname, setMemberNickname] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    // 로그인 상태 확인
    useEffect(() => {
        const checkLogin = () => {
            const token = localStorage.getItem("token");
            const nickname = localStorage.getItem("memberNickname");

            if (token) {
                setIsLoggedIn(true);
                setMemberNickname(nickname || "");
                fetchNotifications();
            } else {
                setIsLoggedIn(false);
            }
        };

        checkLogin();
        window.addEventListener("loginStateChange", checkLogin);

        return () => {
            window.removeEventListener("loginStateChange", checkLogin);
        };
    }, []);

    // 알림 목록 가져오기
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/alert/notifications", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setHasUnread(data.some(n => n.isRead === 'N'));
            }
        } catch (error) {
            console.error("알림 조회 실패:", error);
        }
    };

    // 알림 클릭 시
    const handleNotificationClick = async (notification) => {
        try {
            const token = localStorage.getItem("token");
            
            // 읽음 상태로 변경
            await fetch(`/api/alert/notifications/${notification.notificationId}/read`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            // 상세 페이지로 이동
            navigate(`/board/safety/detail/${notification.notificationId}`);
            setShowNotifications(false);
        } catch (error) {
            console.error("알림 처리 실패:", error);
        }
    };

    // 알림 벨 클릭
    const handleBellClick = () => {
        if (!isLoggedIn) {
            setShowNotifications(true);
        } else {
            setShowNotifications(!showNotifications);
            if (!showNotifications) {
                fetchNotifications();
            }
        }
    };

    // 로그아웃 기능
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("memberId");
        localStorage.removeItem("memberName");
        localStorage.removeItem("memberNickname");
        localStorage.removeItem("adminYn");

        setIsLoggedIn(false);
        navigate("/");
    };

    // 알림 타입별 라벨
    const getTypeLabel = (type) => {
        return type === "위험공표" ? "위험공표" : "가격정보";
    };

    // 시간 포맷팅
    const formatTime = (sentAt) => {
        const date = new Date(sentAt);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return "방금 전";
        if (diffMins < 60) return `${diffMins}분 전`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}시간 전`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}일 전`;
    };

    return (
        <header className="header">
            <div className="header-inner">
                {/* 로고 */}
                <div className="logo-area">
                    <Link to="/">
                        <img src={logo} alt="FocusOnMeal" className="logo-img" />
                    </Link>
                </div>

                {/* 메뉴 */}
                <nav className="nav">
                    <ul className="nav-menu">
                        <li className="dropdown">
                            <Link to="/ingredient/list">식자재</Link>
                            <ul className="dropdown-menu">
                                <li><Link to="/ingredient/list">식자재 목록</Link></li>
                                <li><Link to="/mypage/customIngredients">커스텀 식자재</Link></li>
                            </ul>
                        </li>
                        <li><Link to="/meal/mealAI">식단</Link></li>
                        <li><Link to="/board/safety/list">안전정보</Link></li>
                        <li><Link to="/board/notice/list">공지사항</Link></li>
                    </ul>
                </nav>

                {/* 로그인 상태에 따라 헤더 변경 */}
                <div className="user-area">
                    {isLoggedIn ? (
                        <>
                            <span className="welcome">{memberNickname}님</span>
                            {/* 알림 벨 */}
                            <div className="notification-bell-wrapper" style={{ position: 'relative', marginRight: '15px' }}>
                                <button 
                                    onClick={handleBellClick}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        padding: '5px'
                                    }}
                                >
                                    <Bell size={24} color="#333" />
                                    {hasUnread && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '0',
                                            right: '0',
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: '#ff4444',
                                            borderRadius: '50%'
                                        }}></span>
                                    )}
                                </button>

                                {/* 알림 드롭다운 */}
                                {showNotifications && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: '0',
                                        marginTop: '10px',
                                        width: '350px',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        backgroundColor: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        zIndex: 1000
                                    }}>
                                        {!isLoggedIn ? (
                                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                                <p>로그인이 필요합니다.</p>
                                                <Link to="/member/login" style={{ color: '#4CAF50', textDecoration: 'underline' }}>
                                                    로그인하기
                                                </Link>
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                                알림이 없습니다.
                                            </div>
                                        ) : (
                                            <div>
                                                {notifications.map((notif) => (
                                                    <div
                                                        key={notif.notificationId}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        style={{
                                                            padding: '15px',
                                                            borderBottom: '1px solid #f0f0f0',
                                                            cursor: 'pointer',
                                                            backgroundColor: notif.isRead === 'N' ? '#f8f9fa' : 'white',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.isRead === 'N' ? '#f8f9fa' : 'white'}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                            <span style={{
                                                                display: 'inline-block',
                                                                padding: '2px 8px',
                                                                fontSize: '12px',
                                                                borderRadius: '4px',
                                                                backgroundColor: notif.type === '위험공표' ? '#ff4444' : '#4CAF50',
                                                                color: 'white'
                                                            }}>
                                                                {getTypeLabel(notif.type)}
                                                            </span>
                                                            <span style={{ fontSize: '12px', color: '#999' }}>
                                                                {formatTime(notif.sentAt)}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '14px', fontWeight: notif.isRead === 'N' ? 'bold' : 'normal', marginBottom: '5px' }}>
                                                            {notif.title}
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {notif.message}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Link to="/mypage" className="mypage">마이페이지</Link>
                            <span className="slash">/</span>
                            <button onClick={handleLogout} className="logout">로그아웃</button>
                        </>
                    ) : (
                        <>
                            <Link to="/member/login" className="login">로그인</Link>
                            <span className="slash">/</span>
                            <Link to="/member/form" className="form">회원가입</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;