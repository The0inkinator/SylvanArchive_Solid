import { Outlet } from "solid-start";
import "../layouts/SylvanArchiveBG.module.css";

export default function baseLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
