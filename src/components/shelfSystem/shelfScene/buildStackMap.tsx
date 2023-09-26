import { createEffect } from "solid-js";
import { useStackMapContext } from "../../../context/StackMapContext";

export default function buildStackMap() {
  const [stackMap, { makeStackMap }]: any = useStackMapContext();

  createEffect(async () => {
    try {
      const bindersData = await fetch(
        `https://sylvan-archive-api-03b13d1a78b5.herokuapp.com/tables/binders`
      );
      const rawBindersMap = await bindersData.json();
      console.log("building stack map");
      interface rawBinderObject {
        art: string;
        art_face: string | null;
        art_num: string | null;
        art_set: string | null;
        bgart1: string | null;
        bgart1_face: string | null;
        bgart1_num: string | null;
        bgart1_set: string | null;
        bgart2: string | null;
        bgart2_face: string | null;
        bgart2_num: string | null;
        bgart2_set: string | null;
        bgart3: string | null;
        bgart3_face: string | null;
        bgart3_num: string | null;
        bgart3_set: string | null;
        child_type: string;
        display_name: string;
        name: string;
        parent: string;
      }

      interface bgArts {
        art: string;
        artSet: string | null;
        artNum: string | null;
        artFace: string | null;
      }

      interface binderObject {
        name: string;
        displayName: string;
        parent: string;
        childType: string;
        displayArt: {
          art: string;
          artSet: string | null;
          artNum: string | null;
          artFace: string | null;
        };
        bgArts: bgArts[];
      }

      let binderLookup: Record<string, number> = {};

      const binderMap: binderObject[] = rawBindersMap.map(
        (binderObject: rawBinderObject, index: number) => {
          binderLookup[`${binderObject.name}`] = index;

          return {
            name: binderObject.name,
            displayName: binderObject.display_name,
            parent: binderObject.parent,
            childType: binderObject.child_type,
            displayArt: {
              art: binderObject.art,
              artSet: binderObject.art_set,
              artNum: binderObject.art_num,
              artFace: binderObject.art_face,
            },
            bgArts: {},
          };
        }
      );

      makeStackMap(rawBindersMap);
      console.log(binderLookup);
    } catch (err) {
      console.error(err);
    }
  });
}
