import { useState, useEffect } from 'react';
import styles from './Board.module.css';
import Sidebar from '../../components/admin/Sidebar';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalIngredients: 0,
        totalMealPlans: 0
    });
    
    // 3가지 그래프 데이터
    const [monthlyActivity, setMonthlyActivity] = useState([]);
    const [monthlyNewMembers, setMonthlyNewMembers] = useState([]);
    const [monthlyMealPlans, setMonthlyMealPlans] = useState([]);
    
    // 현재 선택된 그래프 타입
    const [chartType, setChartType] = useState('cumulative'); // cumulative, new, mealplans
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 대시보드 데이터 가져오기
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // sessionStorage에서 JWT 토큰 가져오기
                const token = sessionStorage.getItem('token');
                
                if (!token) {
                    alert('로그인이 필요합니다.');
                    window.location.href = '/login';
                    return;
                }
                
                const response = await axios.get('/api/admin/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setStats(response.data.stats);
                setMonthlyActivity(response.data.monthlyActivity);
                setMonthlyNewMembers(response.data.monthlyNewMembers);
                setMonthlyMealPlans(response.data.monthlyMealPlans);
                setError(null);
            } catch (err) {
                console.error('대시보드 데이터 로드 실패:', err);
                
                if (err.response?.status === 401) {
                    alert('로그인이 필요합니다.');
                    sessionStorage.removeItem('token');
                    window.location.href = '/login';
                } 
                else if (err.response?.status === 403) {
                    alert('관리자 권한이 필요합니다.');
                    window.location.href = '/';
                } 
                else {
                    setError('데이터를 불러오는데 실패했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // 현재 선택된 그래프 데이터 가져오기
    const getCurrentChartData = () => {
        switch(chartType) {
            case 'cumulative':
                return monthlyActivity;
            case 'new':
                return monthlyNewMembers;
            case 'mealplans':
                return monthlyMealPlans;
            default:
                return monthlyActivity;
        }
    };

    // 그래프 제목 가져오기
    const getChartTitle = () => {
        switch(chartType) {
            case 'cumulative':
                return '누적 회원 수 추이';
            case 'new':
                return '월별 신규 회원 수';
            case 'mealplans':
                return '누적 식단 생성 수 추이';
            default:
                return '추이';
        }
    };

    // 그래프 색상 가져오기
    const getChartColor = () => {
        switch(chartType) {
            case 'cumulative':
                return '#2470dc';
            case 'new':
                return '#28a745';
            case 'mealplans':
                return '#ff6b6b';
            default:
                return '#2470dc';
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.loading}>데이터를 불러오는 중...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.error}>{error}</div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Sidebar />

            <main className={styles.main}>
                <h2 className={styles.title}>관리자 대시보드</h2>

                <div className={styles.cards}>
                    <div className={styles.card}>
                        <p className={styles.cardTitle}>회원 수</p>
                        <h3 className={styles.cardValue}>
                            {stats.totalMembers.toLocaleString()}
                        </h3>
                    </div>

                    <div className={styles.card}>
                        <p className={styles.cardTitle}>식자재 수</p>
                        <h3 className={styles.cardValue}>
                            {stats.totalIngredients.toLocaleString()}
                        </h3>
                    </div>

                    <div className={styles.card}>
                        <p className={styles.cardTitle}>식단 생성 수</p>
                        <h3 className={styles.cardValue}>
                            {stats.totalMealPlans.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className={styles.chartBox}>
                    <div className={styles.chartHeader}>
                        <h4>{getChartTitle()}</h4>
                        <div className={styles.chartButtons}>
                            <button
                                className={`${styles.chartBtn} ${chartType === 'cumulative' ? styles.active : ''}`}
                                onClick={() => setChartType('cumulative')}
                            >
                                누적 회원 수
                            </button>
                            <button
                                className={`${styles.chartBtn} ${chartType === 'new' ? styles.active : ''}`}
                                onClick={() => setChartType('new')}
                            >
                                신규 회원 수
                            </button>
                            <button
                                className={`${styles.chartBtn} ${chartType === 'mealplans' ? styles.active : ''}`}
                                onClick={() => setChartType('mealplans')}
                            >
                                식단 생성 수
                            </button>
                        </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getCurrentChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                                type="monotone" 
                                dataKey="members" 
                                stroke={getChartColor()} 
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;