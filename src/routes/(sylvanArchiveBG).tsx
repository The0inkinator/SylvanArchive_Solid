import { Outlet } from "solid-start";
import "../layouts/";

export default function baseLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
