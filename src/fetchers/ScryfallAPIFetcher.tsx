//This file contains scryfall api fetchers
//An overall outline of each function will be noted
//at the top and step by step processes are noted throughout

import { createSignal, createEffect } from 'solid-js';

interface CardIdOptions {
  cardSet?: string;
  cardCollectNum?: number;
  cardFace?: 'front' | 'back';
}

//The CardArtFetcher function takes a card name and then returns the cards art as a url
//The function will return art of Fblthp the Lost if it errors in any way.
//The function can take additional arguments to further specify the card
//The additional arguments are:
// - Card Set (string)- specifying this will return the first art from a matching set code
// - Card Collector Number (number) - specifying this will return the first art with a matching collector number
// (if the Set and Collector numbers do not both match the function will prioritize the set)
// - Card Face ("front" | "back") - specifying which side of the card to take art from if it is double faced
// (defaults to front)
// all of theses are optional if any or all of them are either not submitted or incorrect the function
// will still return an art of the card if it finds one.
// returns asynchronously so all urls should be inserted into elemets with state based jsx

export function CardArtFetcher(
  cardName: string,
  options: CardIdOptions = {}
): Promise<string | null> {
  return new Promise<string | null>(async (resolve) => {
    //Destructures typescript properties for easy referenece
    const { cardSet, cardCollectNum, cardFace } = options;
    //State for selected cardface (passed from props)
    const [selectedCardFace, setSelectedCardFace] = createSignal<number>(0);
    //State for the first card pulled from scryfall based on the name
    const [initCardArt, setInitCardArt] = createSignal<any>(null);
    //State for an array of all versions of the card based on the name
    const [cardVersionArt, setCardVersionArt] = createSignal<any>(null);

    //Empty array that will have various urls mapped to it based on the card art
    const finalInp: any[] = [{}, {}, 0];
    //Function that when called confirms there is art to return and resolves the
    //the fetcher, the function uses the array above to determine which urls based on inputs
    const fetchFinal = () => {
      if (finalInp[0] && finalInp[1]) {
        resolve(finalInp[1]);
      }
    };

    //Sets state for which face of the card to return
    if (cardFace === 'back') {
      setSelectedCardFace(1);
    } else {
      setSelectedCardFace(0);
    }

    createEffect(async () => {
      try {
        //Takes the card name and returns the data from scryfall api
        const inputCardName = await fetch(
          `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
            cardName
          )}`
        );
        //Converts data to a .json object - this is the default image used
        const initCard = await inputCardName.json();

        //Uses the original card to find a list of all versions of the card
        const cardListFetch = await fetch(
          ` https://api.scryfall.com/cards/search?q=${initCard.name}%20unique%3Aprints
          `
        );
        //Converts the data of all cards to an object with all card versions on it
        const cardListObj = await cardListFetch.json();
        //Creates an array where each item is a card version as an object
        const cardVersions = cardListObj.data;

        //Handles the variation in scryfalls format based on a cards number of faces
        if (initCard.card_faces) {
          setInitCardArt(initCard.card_faces[selectedCardFace()]);
          setCardVersionArt(
            cardVersions.map((cardObj: any) => {
              return cardObj.card_faces[selectedCardFace()];
            })
          );
        } else {
          setInitCardArt(initCard);
          setCardVersionArt(cardVersions);
        }
        //Sets the values for the fetchFinal function to the intially called card
        finalInp[0] = initCardArt().image_uris;
        finalInp[1] = initCardArt().image_uris.art_crop;
        //Outputs art based on the passed properties
        //Starts by returning the initial card if no additional props were passed
        //Then checks for a perfect match of set & collector number
        //A perfect match doesn't exist it finds the first match set and if
        //that doesn't exist the first matching collector nubmer
        //if nothing matches returns the default image
        if (!cardSet && !cardCollectNum) {
          fetchFinal();
        } else {
          for (let listPos = cardVersions.length - 1; listPos >= 0; listPos--) {
            const card = cardVersions[listPos];

            if (
              card.set === cardSet &&
              card.collector_number == cardCollectNum
            ) {
              finalInp[2] = listPos;

              break;
            }

            if (card.set === cardSet) {
              finalInp[2] = listPos;
            }

            if (
              card.set !== cardSet &&
              card.collector_number == cardCollectNum
            ) {
              finalInp[2] = listPos;
            }
          }

          if (finalInp[2] !== 0) {
            finalInp[0] = cardVersionArt()[finalInp[2]].image_uris;
            finalInp[1] = cardVersionArt()[finalInp[2]].image_uris.art_crop;
            fetchFinal();
          } else {
            fetchFinal();
          }
        }

        //If a is input that is not found. Makes function always output fblthp art
        resolve(
          'https://cards.scryfall.io/art_crop/front/5/2/52558748-6893-4c72-a9e2-e87d31796b59.jpg?1559959349'
        );
      } catch (error) {
        //If there is an error in the process it logs it and returns fblthp art
        resolve(
          'https://cards.scryfall.io/art_crop/front/5/2/52558748-6893-4c72-a9e2-e87d31796b59.jpg?1559959349'
        );
        console.error(`Error fetching card image for ${cardName}`, error);
      }
    });
  });
}

//The CardFetcher function takes a card name and then returns an image of the card as a url
//The function will return the card Fblthp the Lost if it errors in any way.
//The function can take additional arguments to further specify the card
//The additional arguments are:
// - Card Set (string)- specifying this will return the first card from a matching set code
// - Card Collector Number (number) - specifying this will return the first card with a matching collector number
// (if the Set and Collector numbers do not both match the function will prioritize the set)
// - Card Face ("front" | "back") - specifying which side of the card to show if it is double faced
// (defaults to front)
// all of theses are optional if any or all of them are either not submitted or incorrect the
// function will still return an art of the card if it finds one.
// returns asynchronously so all urls should be inserted into elemets with state based jsx

export function CardFetcher(
  cardName: string,
  options: CardIdOptions = {}
): Promise<string | null> {
  return new Promise<string | null>(async (resolve) => {
    //Destructures typescript properties for easy referenece
    const { cardSet, cardCollectNum, cardFace } = options;
    //State for selected cardface (passed from props)
    const [selectedCardFace, setSelectedCardFace] = createSignal<number>(0);
    //State for the first card pulled from scryfall based on the name
    const [initCardArt, setInitCardArt] = createSignal<any>(null);
    //State for an array of all versions of the card based on the name
    const [cardVersionArt, setCardVersionArt] = createSignal<any>(null);

    //Empty array that will have various urls mapped to it based on the card art
    const finalInp: any[] = [{}, {}, 0];
    //Function that when called confirms there is art to return and resolves the
    //the fetcher, the function uses the array above to determine which urls based on inputs
    const fetchFinal = () => {
      if (finalInp[0] && finalInp[1]) {
        resolve(finalInp[1]);
      }
    };

    //Sets state for which face of the card to return
    if (cardFace === 'back') {
      setSelectedCardFace(1);
    } else {
      setSelectedCardFace(0);
    }

    createEffect(async () => {
      try {
        //Takes the card name and returns the data from scryfall api
        const inputCardName = await fetch(
          `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
            cardName
          )}`
        );
        //Converts data to a .json object - this is the default image used
        const initCard = await inputCardName.json();
        //Uses the original card to find a list of all versions of the card
        const cardListFetch = await fetch(
          ` https://api.scryfall.com/cards/search?q=${initCard.name}%20unique%3Aprints
          `
        );
        //Converts the data of all cards to an object with all card versions on it
        const cardListObj = await cardListFetch.json();
        //Creates an array where each item is a card version as an object
        const cardVersions = cardListObj.data;
        //Handles the variation in scryfalls format based on a cards number of faces
        if (initCard.card_faces) {
          setInitCardArt(initCard.card_faces[selectedCardFace()]);
          setCardVersionArt(
            cardVersions.map((cardObj: any) => {
              return cardObj.card_faces[selectedCardFace()];
            })
          );
        } else {
          setInitCardArt(initCard);
          setCardVersionArt(cardVersions);
        }
        //Sets the values for the fetchFinal function to the intially called card
        finalInp[0] = initCardArt().image_uris;
        finalInp[1] = initCardArt().image_uris.normal;
        //Outputs art based on the passed properties
        //Starts by returning the initial card if no additional props were passed
        //Then checks for a perfect match of set & collector number
        //A perfect match doesn't exist it finds the first match set and if
        //that doesn't exist the first matching collector nubmer
        //if nothing matches returns the default image
        if (!cardSet && !cardCollectNum) {
          fetchFinal();
        } else {
          for (let listPos = cardVersions.length - 1; listPos >= 0; listPos--) {
            const card = cardVersions[listPos];

            if (
              card.set === cardSet &&
              card.collector_number == cardCollectNum
            ) {
              finalInp[2] = listPos;

              break;
            }

            if (card.set === cardSet) {
              finalInp[2] = listPos;
            }

            if (
              card.set !== cardSet &&
              card.collector_number == cardCollectNum
            ) {
              finalInp[2] = listPos;
            }
          }

          if (finalInp[2] !== 0) {
            finalInp[0] = cardVersionArt()[finalInp[2]].image_uris;
            finalInp[1] = cardVersionArt()[finalInp[2]].image_uris.normal;
            fetchFinal();
          } else {
            fetchFinal();
          }
        }

        //If a is input that is not found. Makes function always output fblthp art
        resolve(
          'https://cards.scryfall.io/png/front/5/2/52558748-6893-4c72-a9e2-e87d31796b59.png?1559959349'
        );
      } catch (error) {
        //If there is an error in the process it logs it and returns fblthp art
        resolve(
          'https://cards.scryfall.io/png/front/5/2/52558748-6893-4c72-a9e2-e87d31796b59.png?1559959349'
        );
        console.error(`Error fetching card image for ${cardName}`, error);
      }
    });
  });
}

//The SmallCardFetcher function takes a card name and then returns an image of the card as a url
//The function will return the card Fblthp the Lost if it errors in any way.
//The function can take additional arguments to further specify the card
//The additional arguments are:
// - Card Set (string)- specifying this will return the first card from a matching set code
// - Card Collector Number (number) - specifying this will return the first card with a matching collector number
// (if the Set and Collector numbers do not both match the function will prioritize the set)
// - Card Face ("front" | "back") - specifying which side of the card to show if it is double faced
// (defaults to front)
// all of theses are optional if any or all of them are either not submitted or incorrect the
// function will still return an art of the card if it finds one.
// returns asynchronously so all urls should be inserted into elemets with state based jsx

export function SmallCardFetcher(
  cardName: string,
  options: CardIdOptions = {}
): Promise<string | null> {
  return new Promise<string | null>(async (resolve) => {
    //Destructures typescript properties for easy referenece
    const { cardSet, cardCollectNum, cardFace } = options;
    //State for selected cardface (passed from props)
    const [selectedCardFace, setSelectedCardFace] = createSignal<number>(0);
    //State for the first card pulled from scryfall based on the name
    const [initCardArt, setInitCardArt] = createSignal<any>(null);
    //State for an array of all versions of the card based on the name
    const [cardVersionArt, setCardVersionArt] = createSignal<any>(null);

    //Empty array that will have various urls mapped to it based on the card art
    const finalInp: any[] = [{}, {}, 0];
    //Function that when called confirms there is art to return and resolves the
    //the fetcher, the function uses the array above to determine which urls based on inputs
    const fetchFinal = () => {
      if (finalInp[0] && finalInp[1]) {
        resolve(finalInp[1]);
      }
    };

    //Sets state for which face of the card to return
    if (cardFace === 'back') {
      setSelectedCardFace(1);
    } else {
      setSelectedCardFace(0);
    }

    createEffect(async () => {
      try {
        //Takes the card name and returns the data from scryfall api
        const inputCardName = await fetch(
          `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
            cardName
          )}`
        );
        //Converts data to a .json object - this is the default image used
        const initCard = await inputCardName.json();
        //Uses the original card to find a list of all versions of the card
        const cardListFetch = await fetch(
          ` https://api.scryfall.com/cards/search?q=${initCard.name}%20unique%3Aprints
          `
        );
        //Converts the data of all cards to an object with all card versions on it
        const cardListObj = await cardListFetch.json();
        //Creates an array where each item is a card version as an object
        const cardVersions = cardListObj.data;
        //Handles the variation in scryfalls format based on a cards number of faces
        if (initCard.card_faces) {
          setInitCardArt(initCard.card_faces[selectedCardFace()]);
          setCardVersionArt(
            cardVersions.map((cardObj: any) => {
              return cardObj.card_faces[selectedCardFace()];
            })
          );
        } else {
          setInitCardArt(initCard);
          setCardVersionArt(cardVersions);
        }
        //Sets the values for the fetchFinal function to the intially called card
        finalInp[0] = initCardArt().image_uris;
        finalInp[1] = initCardArt().image_uris.small;
        //Outputs art based on the passed properties
        //Starts by returning the initial card if no additional props were passed
        //Then checks for a perfect match of set & collector number
        //A perfect match doesn't exist it finds the first match set and if
        //that doesn't exist the first matching collector nubmer
        //if nothing matches returns the default image
        if (!cardSet && !cardCollectNum) {
          fetchFinal();
        } else {
          for (let listPos = cardVersions.length - 1; listPos >= 0; listPos--) {
            const card = cardVersions[listPos];

            if (
              card.set === cardSet &&
              card.collector_number == cardCollectNum
            ) {
              finalInp[2] = listPos;

              break;
            }

            if (card.set === cardSet) {
              finalInp[2] = listPos;
            }

            if (
              card.set !== cardSet &&
              card.collector_number == cardCollectNum
            ) {
              finalInp[2] = listPos;
            }
          }

          if (finalInp[2] !== 0) {
            finalInp[0] = cardVersionArt()[finalInp[2]].image_uris;
            finalInp[1] = cardVersionArt()[finalInp[2]].image_uris.small;
            fetchFinal();
          } else {
            fetchFinal();
          }
        }

        //If a is input that is not found. Makes function always output fblthp art
        resolve(
          'https://cards.scryfall.io/png/front/5/2/52558748-6893-4c72-a9e2-e87d31796b59.png?1559959349'
        );
      } catch (error) {
        //If there is an error in the process it logs it and returns fblthp art
        resolve(
          'https://cards.scryfall.io/png/front/5/2/52558748-6893-4c72-a9e2-e87d31796b59.png?1559959349'
        );
        console.error(`Error fetching card image for ${cardName}`, error);
      }
    });
  });
}
