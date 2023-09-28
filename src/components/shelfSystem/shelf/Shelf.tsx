import "./shelfStyles.css";
import Stack from "../stack/Stack";
import { useStackStateContext } from "../../../context/StackStateContext";
import { createSignal, onMount } from "solid-js";

interface ShelfInputs {
  stackID: string;
}

let shelfContainer: any;

export default function Shelf({ stackID }: ShelfInputs) {
  const [upperMargin, setUpperMargin] = createSignal<number>(0);
  const [stackState, { setShelfHeight }]: any = useStackStateContext();

  onMount(() => {
    if (stackState().stackCount === 0) {
      const containerHeight = shelfContainer.offsetHeight;

      const windowHeight = window.innerHeight;
      const newUpperMargin = windowHeight / 2 - containerHeight / 2;
      setShelfHeight(containerHeight);
      setUpperMargin(newUpperMargin);
    } else {
      setUpperMargin(0);
    }

    const handleResize = () => {
      if (upperMargin() > 0) {
        const containerHeight = shelfContainer.offsetHeight;
        const windowHeight = window.innerHeight;
        const newUpperMargin = windowHeight / 2 - containerHeight / 2;
        setShelfHeight(containerHeight);
        setUpperMargin(newUpperMargin);
      }
    };
    window.addEventListener("resize", handleResize);
  });

  return (
    <div
      class="shelfContainer"
      ref={shelfContainer}
      style={{
        "margin-top": upperMargin() > 0 ? `${upperMargin()}px` : "0px",
      }}
    >
      <div class="stackSlider"></div>
    </div>
  );
}
