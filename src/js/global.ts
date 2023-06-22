import Swup, { Handler, Location } from "swup";
import ScrollPlugin from "@swup/scroll-plugin";
import BodyClassPlugin from "@swup/body-class-plugin";
import PreloadPlugin from "@swup/preload-plugin";
import FragmentPlugin, {
  FragmentRule,
  FragmentRoute,
} from "@swup/fragment-plugin";
// import FragmentPlugin, {
//   FragmentRule,
//   FragmentRoute,
// } from "../../packages/fragment-plugin/src/index.js";

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
const showFragmentsTooltip = (
  el: HTMLAnchorElement,
  selectors: string[]
): void => {
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
const onHoverLink = ({
  delegateTarget,
}: {
  delegateTarget: HTMLAnchorElement;
}) => {
  // Get the fragment plugin
  const fragmentPlugin = swup.findPlugin("FragmentPlugin") as
    | FragmentPlugin
    | undefined;
  if (!fragmentPlugin) return;

  // Get the route of the link
  const route: FragmentRoute = {
    from: Location.fromUrl(window.location.href).url,
    to: Location.fromElement(delegateTarget).url,
  };

  // Get the matching rule for the link
  const rule: FragmentRule | undefined =
    fragmentPlugin.getFirstMatchingRule(route);

  // Get the fragments of the rule or the default `containers` from swup
  const fragmentsFromRule = rule?.fragments ?? swup.options.containers;

  // Remove fragments that already match the current URL
  const fragmentsToReplace = fragmentsFromRule.filter((selector) =>
    fragmentPlugin.validateFragment(selector, route.to)
  );

  // If there will be fragments replaced, show a tooltip
  if (fragmentsToReplace.length)
    showFragmentsTooltip(delegateTarget, fragmentsToReplace);
};
// @ts-ignore
!isTouch() && swup.on("hoverLink", onHoverLink);
