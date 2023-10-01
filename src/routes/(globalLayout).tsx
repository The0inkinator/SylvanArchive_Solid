import { Outlet } from "solid-start";
import styles from "../layouts/SylvanArchiveBG.module.css";

export default function globalLayout() {
  return (
    <>
      <div class={styles.contentContainer}>
        <Outlet />
        <div class={styles.overlayGradient}></div>
        <div class={styles.bgImage}></div>
      </div>
    </>
  );
}
