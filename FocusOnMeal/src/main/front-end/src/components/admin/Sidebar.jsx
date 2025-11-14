import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <ul className={styles.menuList}>

                <li>
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.menuTitle
                        }>
                        관리자 홈
                    </NavLink>
                </li>

                <li className={styles.menuTitle}>
                    <NavLink
                        to="/admin/memberInfo"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.menuTitle
                        }>
                        회원 관리
                    </NavLink>
                </li>

                <li className={styles.menuTitle}>데이터 관리</li>
                <li>
                    <NavLink
                        to="/admin/safetyInfo"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        안전 정보 관리
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/admin/ingredientInfo"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.subItem
                        }
                    >
                        식재료 관리
                    </NavLink>
                </li>

                <li className={styles.menuTitle}>
                    <NavLink
                        to="/admin/noticeInfo"
                        className={({ isActive }) =>
                            isActive ? styles.active : styles.menuTitle
                        }>
                        공지사항 관리
                    </NavLink>
                </li>
                <li className={styles.menuTitle}>배치 / 로그</li>
            </ul>
        </aside>
    );
};

export default Sidebar;
