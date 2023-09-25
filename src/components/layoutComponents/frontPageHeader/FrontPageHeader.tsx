import styles from "./FrontPageHeader.module.css";
import FloatingMenu from "../../../components/floatingMenu/FloatingMenu";

export default function FrontPageHeader() {
  return (
    <div class={styles.headerBar}>
      <FloatingMenu />
    </div>
  );
}
