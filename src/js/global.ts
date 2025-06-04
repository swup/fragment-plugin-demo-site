import Swup, { Handler, Location } from "swup";
import { isTouch, sleep } from "./frontend.js";
import SwupFragmentPlugin, {
  Rule as FragmentRule,
} from "@swup/fragment-plugin";
import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupHeadPlugin from "@swup/head-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import SwupScrollPlugin from "@swup/scroll-plugin";
// import ParallelPlugin from "@swup/parallel-plugin";

import tippy, { followCursor } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import feather from "feather-icons";

import Alpine from "alpinejs";
import type { AlpineComponent } from "alpinejs";
export const defineComponent = <P, T>(fn: (params: P) => AlpineComponent<T>) => fn; // prettier-ignore

/**
 * Checks:
 *
 * - swup.preload not detected (solved using `export interface Swup` instead of `export class Swup`)
 * - swup.getFragmentVisit suddenly has problems with `this` (solved)
 * - Handler<"link:hover"> should be simpler to use (only args, no visit)
 */

/** RULES START **/
/**
 * Define the rules for Fragment Plugin
 */
const rules: FragmentRule[] = [
  // Rule 1: Between the various views of the characters list
  {
    from: "/characters/:filter?",
    to: "/characters/:filter?",
    containers: ["#characters-list"],
  },
  // Rule 2: From the list of characters to a character detail page
  {
    from: "/characters/:filter?",
    to: "/character/:character",
    containers: ["#character-modal"],
    name: "open-character",
  },
  // Rule 3: From a single character back to the list of characters
  {
    from: "/character/:character",
    to: "/characters/:filter?",
    containers: ["#character-modal", "#characters-list"],
    name: "close-character",
  },
  // Rule 4: Between characters (previous/next)
  {
    from: "/character/:character",
    to: "/character/:character",
    containers: ["#character-detail"],
  },
];
/** RULES END **/

/**
 * Initialize Swup
 */
const swup = new Swup({
  animateHistoryBrowsing: false,
  cache: true,
  plugins: [
    new SwupFragmentPlugin({
      rules,
      debug: true,
    }),
    new SwupPreloadPlugin({ preloadVisibleLinks: true }),
    new SwupHeadPlugin(),
    new SwupA11yPlugin(),
    new SwupScrollPlugin({
      offset: () => {
        const header = document.querySelector(".global-header") as HTMLElement;
        return header.offsetHeight + 15;
      },
    }),
  ],
});

const closeModal = () => {
  const closeLink = document.querySelector(
    "a.character_close"
  ) as HTMLAnchorElement;
  if (closeLink) swup.navigate(closeLink.href);
};

const Modal = defineComponent(() => {
  return {
    open: true,
    onScroll() {
      if (!this.open) return;
      if (!this.$refs.detail) return;
      const rect = this.$refs.detail.getBoundingClientRect();

      if (rect.bottom < 0) {
        this.open = false;
        closeModal();
      }
    },
  };
});

Alpine.data("Modal", Modal);

Alpine.start();

// swup.hooks.on("animation:in:start", async (context) => {
//   await sleep(20000);
// });

/**
 * Close eventual modals using the Escape key
 */
const onKeyDown = (e: KeyboardEvent) => {
  if (e.metaKey) return;

  switch (e.key) {
    case "Escape":
      closeModal();
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
 * Show a tooltip with the targeted fragment elements when hovering internal links
 */
const showInternalLinkTooltip = (
  el: HTMLAnchorElement,
  containers: string[]
): void => {
  // Early returns
  if (!containers.length) return;
  if (isTouch()) return;

  const tippyInstance = tippy(el, {
    allowHTML: true,
    theme: "light",
    content: `replaces ${humanReadableArray(
      containers.map((selector) => `<code>${selector}</code>`)
    )}`,
    plugins: [followCursor],
    followCursor: el.matches("[data-tippy-follow]"),
    duration: 0,
    appendTo: "parent",
    maxWidth: 400,
  });
  el.addEventListener("mouseleave", () => tippyInstance.destroy(), {
    once: true,
  });
};

/**
 * Show a tooltip containing the targeted fragment containers when hovering swup links
 */
const onHoverLink: Handler<"link:hover"> = (visit, { el }) => {
  if (!(el instanceof HTMLAnchorElement)) return;

  // ignore anchor links
  if (el.getAttribute("href")?.startsWith("#")) return;

  // ignore links to same page
  if (
    Location.fromElement(el).url === Location.fromUrl(window.location.href).url
  )
    return;

  const fragmentPlugin = swup.findPlugin('SwupFragmentPlugin') as SwupFragmentPlugin;

  const fragmentVisit = fragmentPlugin.getFragmentVisit({
    from: window.location.pathname,
    to: el.pathname,
  });

  showInternalLinkTooltip(
    el,
    fragmentVisit?.containers.map((selector) => selector) ||
      swup.options.containers
  );
};
swup.hooks.on("link:hover", onHoverLink);

// Reset the scroll of the modal when switching #character-detail
const onContentReplace: Handler<"content:replace"> = (context) => {
  const modal = document.querySelector(
    "#character-modal"
  ) as HTMLElement | null;
  if (modal) modal.scrollTo({ top: 0, left: 0 });
};
swup.hooks.on("content:replace", onContentReplace);

function addAnchorLinks() {
  const headings = document
    .querySelector(".text")
    ?.querySelectorAll("h2, h3, h4, h5");

  headings?.forEach((heading) => {
    if (!heading.id) return;
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.classList.add("anchor-link");
    link.innerHTML = `
    <span class='anchor-link_icon'>${feather.icons.link.toSvg()}</span>
    <span class='anchor-link_text'>${heading.innerHTML}</span>
  `;
    heading.innerHTML = link.outerHTML;
  });
}
swup.hooks.on("page:view", addAnchorLinks);
addAnchorLinks();
