import BaseLayout from "@/components/BaseLayout";
import styles from "../styles/Analises.module.css";

export default function Home() {
  return (
    <BaseLayout>
      <div className={styles.div}>
        <div className={styles.body}>
          <main className={styles.main}>
            <h1>Análises</h1>
            <div className={styles.date}>
              <input type="date" />
            </div>
            <div className={styles.insights}>
              <div className={styles.carsParked}>
                <span className="material-icons">directions_car</span>
                <div className={styles.middle}>
                  <div className={styles.left}>
                    <h3>Carros estacionados</h3>
                    <h1>0</h1>
                  </div>
                  <div className={styles.progress}>
                    <svg>
                      <circle cx={38} cy={38} r={36}></circle>
                    </svg>
                    <div className={styles.number}>
                      <p>0%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.totalParking}>
                <span className="material-icons">analytics</span>
                <div className={styles.middle}>
                  <div className={styles.left}>
                    <h3>Total de ganho</h3>
                    <h1>R$00,00</h1>
                  </div>
                  <div className={styles.progress}>
                    <svg>
                      <circle cx={38} cy={38} r={36}></circle>
                    </svg>
                    <div className={styles.number}>
                      <p>0%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.recentOrders}>
              <h2>Carros cadastrados recentemente</h2>
              <table>
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Modelo</th>
                    <th>Cor</th>
                    <th>Proprietário</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ABC-1234</td>
                    <td>Honda Civic</td>
                    <td>Prata</td>
                    <td>João Silva</td>
                  </tr>
                  <tr>
                    <td>Teste</td>
                    <td>Teste</td>
                    <td>Teste</td>
                    <td>Teste</td>
                  </tr>
                </tbody>
              </table>
              <a href="#">Mostrar Todos</a>
            </div>
        </main>
        </div>
      </div>
    </BaseLayout>
  );
}