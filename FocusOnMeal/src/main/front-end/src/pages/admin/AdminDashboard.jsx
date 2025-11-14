import styles from './Dashboard.module.css';
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

const AdminDashboard = () => {

    const data = [
        { month: "Jan", members: 120 },
        { month: "Feb", members: 200 },
        { month: "Mar", members: 350 },
        { month: "Apr", members: 280 },
        { month: "May", members: 320 },
        { month: "Jun", members: 500 },
        { month: "Jul", members: 450 },
        { month: "Aug", members: 470 },
        { month: "Sep", members: 550 },
        { month: "Oct", members: 600 },
        { month: "Nov", members: 720 },
        { month: "Dec", members: 850 },
    ];

    return (
        <div className={styles.container}>
            
            <Sidebar />

            <main className={styles.main}>
                
                <h2 className={styles.title}>관리자 대시보드</h2>

                <div className={styles.cards}>

                    <div className={styles.card}>
                        <p className={styles.cardTitle}>회원 수</p>
                        <h3 className={styles.cardValue}>5000</h3>
                    </div>

                    <div className={styles.card}>
                        <p className={styles.cardTitle}>식자재 수</p>
                        <h3 className={styles.cardValue}>1253</h3>
                    </div>

                    <div className={styles.card}>
                        <p className={styles.cardTitle}>회원 활동 수</p>
                        <h3 className={styles.cardValue}>102</h3>
                    </div>

                </div>

                <div className={styles.chartBox}>
                    <h4>회원 활동 추이</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="members" stroke="#2470dc" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </main>

        </div>
    );
};

export default AdminDashboard;
