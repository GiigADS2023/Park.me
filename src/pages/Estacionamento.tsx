import BaseLayout from "@/components/BaseLayout";
import { PiClockCountdownThin } from "react-icons/pi";
import React, { ReactNode } from 'react';
import styles from '../styles/Estacionamento.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={`${styles.cardContainer} ${className}`}>
      {children}
    </div>
  );
}

export default function Estacionamento() {
  return (
    <BaseLayout>
      <div className={styles.div}>
        <div className={styles.body}>
          <div className={styles.mainContainer}>
            <Card>
              <div className={styles.identifierContainer}>
                <h2>ABC-1234</h2>
              </div>
              <div className={styles.vehicleContainer}>
                <span>Veículo</span>
                <h2>Honda Civic</h2>
              </div>
              <div className={styles.timesContainer}>
                <span className={styles.start}>
                  <PiClockCountdownThin aria-label="Start time" />
                  22/10/2024 - 10:00
                </span>
                <span className={styles.end}>
                  <PiClockCountdownThin aria-label="End time" />
                  --/--/---- - --:--
                </span>
              </div>
            </Card>
            <Card className={styles.addCard}>
              +
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}