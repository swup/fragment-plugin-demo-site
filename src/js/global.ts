import Swup, { Handler, Location } from "swup";
// import ScrollPlugin from "@swup/scroll-plugin";
// import BodyClassPlugin from "@swup/body-class-plugin";
// import PreloadPlugin from "@swup/preload-plugin";
import { isTouch } from "./frontend.js";
import FragmentPlugin from "@packages/fragment-plugin/src/index.js";

import tippy, { followCursor, Placement as TippyPlacement } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import type SwupFragmentPlugin from "@packages/fragment-plugin/src/SwupFragmentPlugin.js";

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
    // new ScrollPlugin(),
    // new BodyClassPlugin(),
    // new PreloadPlugin(),
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
 * Convert an array into a human readable string
 * @see https://stackoverflow.com/a/3765601/586823
 */
const humanReadableArray = (
  array: string[],
  join = ", ",
  final = " and "
): string =>
  array.reduce(function (accumulator, currentValue, index, arr) {
    return (
      accumulator + (index == arr.length - 1 ? final : join) + currentValue
    );
  });

/**
 * Show a tooltip with the targeted fragments when hovering internal links
 */
const showInternalLinkTooltip = (
  el: HTMLAnchorElement,
  selectors: string[]
): void => {
  // Early returns
  if (!selectors.length) return;
  if (isTouch()) return;

  const tippyInstance = tippy(el, {
    allowHTML: true,
    theme: "light",
    content: `replaces ${humanReadableArray(
      selectors.map((selector) => `<code>${selector}</code>`)
    )}`,
    plugins: [followCursor],
    followCursor: el.matches("[data-tippy-follow]"),
    duration: 0,
  });
  el.addEventListener("mouseleave", () => tippyInstance.destroy(), {
    once: true,
  });
};

/**
 * Show a tooltip containing the targeted fragments when hovering swup links
 */
const onHoverLink = ({ target: el }) => {
  const isLink = el instanceof HTMLAnchorElement;
  if (!isLink) return;

  // only do this for internal links
  if (el.origin !== location.origin) return;

  // Get the fragment plugin
  const fragmentPlugin: SwupFragmentPlugin | undefined = swup.findPlugin(
    "SwupFragmentPlugin"
  ) as SwupFragmentPlugin | undefined;
  if (!fragmentPlugin) return;

  const { fragments } = fragmentPlugin.createContext({
    from: Location.fromUrl(window.location.href).url,
    to: Location.fromElement(el).url,
  });

  showInternalLinkTooltip(el, fragments || swup.options.containers);
};
// Delegate mouseenter
swup.delegateEvent(
  swup.options.linkSelector,
  'mouseenter',
  onHoverLink,
  { capture: true }
)

// Scroll overlays when switching
const onReplaceContent: Handler<"replaceContent"> = (context) => {
  const overlay = document.querySelector("#overlay") as HTMLElement | null;
  if (overlay) overlay.scrollTop = 0;
}
swup.hooks.on('replaceContent', onReplaceContent);