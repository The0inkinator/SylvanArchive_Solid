import styles from "../layouts/HomeLayout.module.css";
import FrontPageHeader from "../components/layoutComponents/frontPageHeader/FrontPageHeader";
import ShelfScene from "../components/shelfSystem/shelfScene/ShelfScene";
//vercel commit

export default function Home() {
  return (
    <>
      {/* <div class={styles.contentContainer}> */}
      <FrontPageHeader />
      <ShelfScene />
      {/* </div> */}
      <div class={styles.overlayGradient}></div>
      <div class={styles.bgImage}></div>
    </>
  );
}
