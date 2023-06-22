import Swup, { Handler, Location } from "swup";
import ScrollPlugin from "@swup/scroll-plugin";
import BodyClassPlugin from "@swup/body-class-plugin";
import PreloadPlugin from "@swup/preload-plugin";
// import FragmentPlugin, { Route } from "@swup/fragment-plugin";
import FragmentPlugin, {
  Route,
} from "../../packages/fragment-plugin/src/index.js";

import { isTouch } from "./frontend.js";

interface DOMEvent<T extends EventTarget> extends Event {
  readonly target: T;
}

import tippy, { followCursor, Placement as TippyPlacement } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

/** PRINT START **/
/**
 * Define the rules for Fragment Plugin
 */
const rules = [
  // Rule 1: Between filters of the list
  {
    from: "/characters/:filter?",
    to: "/characters/:filter?",
    fragments: ["#list"],
    name: "replaceCharacters",
  },
  // Rule 2: From the list to an overlay
  {
    from: "/characters/:filter?",
    to: "/character/:character",
    fragments: ["#overlay"],
    name: "openOverlay",
  },
  // Rule 3: From an overlay back to the list
  {
    from: "/character/:character",
    to: "/characters/:filter?",
    fragments: ["#overlay", "#list"],
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
/** PRINT END **/

/**
 * Initialize Swup
 */
const swup = new Swup({
  animateHistoryBrowsing: true,
  plugins: [
    new ScrollPlugin(),
    new BodyClassPlugin(),
    new PreloadPlugin(),
    new FragmentPlugin({ rules, debug: true }),
  ],
});

/**
 * Close eventual overlays using the Escape key
 */
const onKeyDown = (e: KeyboardEvent) => {
  if (e.metaKey) return;

  const characterClose = document.querySelector(
    "a.character_close"
  ) as HTMLAnchorElement;

  switch (e.key) {
    case "Escape":
      if (characterClose) characterClose.click();
      break;
  }
};
window.addEventListener("keydown", onKeyDown);

/**
 * Show a tooltip with the targeted fragments when hovering internal links
 */
const showFragmentsTooltip = (
  el: HTMLAnchorElement,
  fragments: string[]
): void => {
  const tippyInstance = tippy(el, {
    allowHTML: true,
    theme: "light",
    content: `fragments: ${fragments.map(selector => `${selector}`).join(", ")}`,
    plugins: [followCursor],
    followCursor: el.matches("[data-tippy-follow]"),
    duration: 0,
  });
  el.addEventListener(
    "mouseleave",
    () => tippyInstance.destroy(),
    { once: true }
  );
};

/**
 * Fired when hovering an internal link
 */
const onHoverLink = ({
  delegateTarget,
}: {
  delegateTarget: HTMLAnchorElement;
}) => {
  const fragmentPlugin = swup.findPlugin("FragmentPlugin") as FragmentPlugin;
  if (!fragmentPlugin) return;

  const route: Route | undefined = fragmentPlugin.getFirstMatchingRule({
    from: Location.fromUrl(window.location.href).url,
    to: Location.fromElement(delegateTarget).url,
  });

  showFragmentsTooltip(delegateTarget, route?.fragments ?? ["#swup"]);
};
// @ts-ignore
!isTouch() && swup.on("hoverLink", onHoverLink);
