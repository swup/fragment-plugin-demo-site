import Swup, { Handler } from "swup";
// @ts-ignore
import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupFragmentPlugin from "../../../fragment-plugin/src/index.js";
// import SwupFragmentPlugin from "@swup/fragment-plugin";
// @ts-ignore
import SwupBodyClassPlugin from "@swup/body-class-plugin";

import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

/** PRINT START **/
const rules = [
  // Rule 1: Between filters of the list
  {
    from: ["/characters/", "/characters/:filter"],
    to: ["/characters/", "/characters/:filter"],
    fragments: ["#teasers"],
    name: "replaceCharacters",
  },
  // Rule 2: From the list to an overlay
  {
    from: ["/characters/", "/characters/:filter"],
    to: "/character/:character",
    fragments: ["#overlay"],
    name: "openOverlay",
  },
  // Rule 3: From an overlay back to the list
  {
    from: "/character/:character",
    to: ["/characters/", "/characters/:filter"],
    fragments: ["#overlay", "#teasers"],
    name: "closeOverlay",
  },
  // Rule 4: Between overlays
  {
    from: "/character/:character",
    to: "/character/:character",
    fragments: ["#detail"],
    name: "replaceCharacter",
  },
];

const swup = new Swup({
  animateHistoryBrowsing: true,
  plugins: [
    new SwupScrollPlugin(),
    new SwupBodyClassPlugin(),
    new SwupFragmentPlugin({ rules }),
  ],
});
/** PRINT END **/


function initTippy() {
  tippy(`[data-tippy]`, {
    allowHTML: true,
    content: (ref) => String(ref.getAttribute("data-tippy")),
  });
}

function initPageView() {
  initTippy();
}
initPageView();

swup.on("contentReplaced", () => initPageView());

let characterCloseUrl = "";
const setCharacterCloseUrl: Handler<"transitionStart"> = (e) => {
  if (document.querySelector(".character")) return;
  characterCloseUrl = window.location.href;
};
swup.on("transitionStart", setCharacterCloseUrl);

const applycharacterCloseUrl: Handler<"contentReplaced"> = (e) => {
  if (!characterCloseUrl) return;
  document
    .querySelectorAll("[data-close-character]")
    .forEach((el) => ((el as HTMLAnchorElement).href = characterCloseUrl));
};
swup.on("contentReplaced", applycharacterCloseUrl);

const onKeyDown = (e: KeyboardEvent) => {
  const character = document.querySelector(".character");
  if (!character) return;

  if (e.metaKey) return;

  switch (e.key) {
    case "Escape":
      (
        character.querySelector("a.character_close") as HTMLAnchorElement
      ).click();
      break;
    case "ArrowLeft":
      (
        character.querySelector(
          ".character_nav_link.--previous"
        ) as HTMLAnchorElement
      ).click();
      break;
    case "ArrowRight":
      (
        character.querySelector(
          ".character_nav_link.--next"
        ) as HTMLAnchorElement
      ).click();
      break;
  }
};
window.addEventListener("keydown", onKeyDown);