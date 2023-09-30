import { createEffect } from "solid-js";
import { useStackMapContext } from "../../../context/StackMapContext";
import { useStackStateContext } from "../../../context/StackStateContext";

export default function buildStackMap() {
  const [stackMap, { makeStackMap }]: any = useStackMapContext();
  const [stackState, { updateStackMapLoadStatus }]: any =
    useStackStateContext();

  createEffect(async () => {
    try {
      const bindersData = await fetch(
        `https://sylvan-archive-api-03b13d1a78b5.herokuapp.com/tables/binders`
      );
      const rawBindersMap = await bindersData.json();
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

      interface stackObject {
        name: string;
        children: string[];
      }

      interface stackMapSlots {
        stackList: stackObject[];
        binderList: binderObject[];
      }

      let finalStackList: stackObject[] = [];
      let finalBinderList: binderObject[] = [];

      rawBindersMap.map((binderObject: rawBinderObject, index: number) => {
        let tempBgArts: bgArts[] = [];

        if (binderObject.bgart1) {
          tempBgArts.push({
            art: binderObject.bgart1,
            artSet: binderObject.bgart1_set,
            artNum: binderObject.bgart1_num,
            artFace: binderObject.bgart1_face,
          });
        }

        if (binderObject.bgart2) {
          tempBgArts.push({
            art: binderObject.bgart2,
            artSet: binderObject.bgart2_set,
            artNum: binderObject.bgart2_num,
            artFace: binderObject.bgart2_face,
          });
        }

        if (binderObject.bgart3) {
          tempBgArts.push({
            art: binderObject.bgart3,
            artSet: binderObject.bgart3_set,
            artNum: binderObject.bgart3_num,
            artFace: binderObject.bgart3_face,
          });
        }

        finalBinderList[index] = {
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
          bgArts: tempBgArts,
        };

        const tempChildrenBinderList: binderObject[] = rawBindersMap.filter(
          (binder: rawBinderObject) => binder.parent === binderObject.name
        );

        const tempChildrenNameList: string[] = tempChildrenBinderList.map(
          (binder) => {
            return binder.name;
          }
        );

        finalStackList[index] = {
          name: binderObject.name,
          children: tempChildrenNameList,
        };
      });

      const stackMap: stackMapSlots = {
        stackList: finalStackList,
        binderList: finalBinderList,
      };

      makeStackMap(stackMap);
      updateStackMapLoadStatus(true);
    } catch (err) {
      console.error(err);
    }
  });
}
