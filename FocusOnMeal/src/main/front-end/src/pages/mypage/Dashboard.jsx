import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Dashboard.module.css";
import Sidebar from "../../components/mypage/Sidebar";

const Dashboard = () => {
    return (
        <>
            <div className={styles.container}>
            <Sidebar />
                {/* 메인 영역 */}
                <main className={styles.main}>
                    <h2>닉네임님 환영합니다!</h2>
                </main>

            </div>
        </>
    );
};

export default Dashboard;
