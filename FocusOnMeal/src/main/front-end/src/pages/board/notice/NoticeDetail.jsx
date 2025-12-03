import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./NoticeDetail.module.css";
import Footer from "../../../components/common/Footer";

const NoticeDetail = () => {
    const { noticeNo } = useParams();
    const navigate = useNavigate();

    const [prev, setPrev] = useState(null);
    const [next, setNext] = useState(null);
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!noticeNo || isNaN(parseInt(noticeNo))) {
            setError("공지 번호가 유효하지 않습니다.");
            setLoading(false);
            return;
        }

        const fetchNoticeDetail = async () => {
            try {
                setLoading(true);

                const response = await axios.get(`/api/board/notice/view/${noticeNo}`);
                
                console.log("=== API 응답 ===");
                console.log("response.data:", response.data);
                console.log("notice:", response.data.notice);
                console.log("prev:", response.data.prev);
                console.log("next:", response.data.next);
                
                setNotice(response.data.notice);
                setPrev(response.data.prev);  // null이면 null로 설정됨
                setNext(response.data.next);  // null이면 null로 설정됨
                
                setLoading(false);

            } catch (err) {
                console.error("❌ 에러:", err);
                setError("해당 공지사항을 찾을 수 없습니다.");
                setLoading(false);
            }
        };

        fetchNoticeDetail();
    }, [noticeNo]);

    // 이전/다음 글 이동
    const handlePrevClick = () => {
        if (prev) {
            navigate(`/board/notice/detail/${prev.noticeNo}`);
        }
    };

    const handleNextClick = () => {
        if (next) {
            navigate(`/board/notice/detail/${next.noticeNo}`);
        }
    };

    if (loading) {
        return <div className={styles.loading}>공지사항을 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!notice) {
        return <div className={styles.error}>해당 공지사항을 찾을 수 없습니다.</div>;
    }

    return (
        <>
        <div className={styles.container}>
            <div className={styles.detailWrapper}>
                <h1 className={styles.pageTitle}>공지사항</h1>

                <div className={styles.noticeHeader}>
                    <div className={styles.subjectRow}>
                        {notice.noticeImportant === "Y" && (
                            <span className={styles.badgeImportant}>필독 !</span>
                        )}

                        {notice.noticeImportant !== "Y" &&
                            notice.noticeIsNew === "Y" && (
                                <span className={styles.badgeIsNew}>NEW</span>
                        )}

                        <h2 className={styles.noticeSubject}>
                            {notice.noticeSubject}
                        </h2>
                    </div>

                    <div className={styles.infoBar}>
                        <span className={styles.infoItem}>
                            작성자: 관리자
                        </span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.infoItem}>
                            작성일: {new Date(notice.noticeCreateAt).toLocaleDateString("ko-KR")}
                        </span>
                        <span className={styles.separator}>|</span>
                        <span className={styles.infoItem}>
                            조회수: {notice.viewCount}
                        </span>
                    </div>
                </div>

                <div className={styles.noticeContent}>
                    <p>{notice.noticeContent}</p>
                </div>

                {/* 이전/다음 글 영역 */}
                <div className={styles.actionButtons}>
                    <div className={styles.prevNextWrapper}>
                        <div 
                            className={`${styles.prevRow} ${!prev ? styles.disabled : ''}`}
                            onClick={handlePrevClick}
                            style={{ cursor: prev ? 'pointer' : 'default' }}
                        >
                            <span className={styles.label}>이전글</span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.noticeTitle}>
                                {prev ? prev.noticeTitle : '이전글이 없습니다.'}
                            </span>
                        </div>

                        {/* 다음글 */}
                        <div
                            className={`${styles.nextRow} ${!next ? styles.disabled : ''}`}
                            onClick={handleNextClick}
                            style={{ cursor: next ? 'pointer' : 'default' }}
                        >
                            <span className={styles.label}>다음글</span>
                            <span className={styles.separator}>|</span>
                            <span className={styles.noticeTitle}>
                                {next ? next.noticeTitle : '다음글이 없습니다.'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 목록 버튼 */}
                <div className={styles.listButtonWrapper}>
                    <button
                        className={styles.listBtn}
                        onClick={() => navigate("/board/notice/list")}
                    >
                        목록으로
                    </button>
                </div>
            </div>
        </div>
        <Footer/>
        </>
    );
};

export default NoticeDetail;