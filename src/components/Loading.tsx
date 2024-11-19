import React from "react";
import { BiLoaderAlt } from 'react-icons/bi';

import styles from '../styles/Loading.module.css';

function Loading() {
  return (
    <div className={styles["loading-container"]}>
    <BiLoaderAlt className={styles["loading"]} />
  </div>
  );
}

export default Loading;