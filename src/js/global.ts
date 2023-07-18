import Swup, { Handler, Location, Context } from "swup";
import { isTouch, sleep } from "./frontend.js";
import FragmentPlugin, {
  Options as FragmentPluginOptions,
} from "@swup/fragment-plugin";
// import ParallelPlugin from "@swup/parallel-plugin";

import tippy, { followCursor } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import feather from "feather-icons";

import Alpine, {AlpineComponent} from "alpinejs";

/** RULES START **/
/**
 * Define the rules for Fragment Plugin
 */
const rules: FragmentPluginOptions["rules"] = [
  // Rule 1: Between filters of the list
  {
    from: "/characters/:filter?",
    to: "/characters/:filter?",
    fragments: ["#list"],
  },
  // Rule 2: From the list to an overlay.
  // We want the overlay to be `teleport`ed to the root of the document.
  {
    from: "/characters/:filter?",
    to: "/character/:character",
    fragments: ["#overlay"],
    name: "open-overlay",
  },
  // Rule 3: From an overlay back to the list
  {
    from: "/character/:character",
    to: "/characters/:filter?",
    fragments: ["#overlay", "#list"],
    name: "close-overlay",
  },
  // Rule 4: Between overlays
  {
    from: "/character/:character",
    to: "/character/:character",
    fragments: ["#detail"],
  }
];
/** RULES END **/

/**
 * Initialize Swup
 */
const swup = new Swup({
  animateHistoryBrowsing: false,
  plugins: [
    new FragmentPlugin({
      rules,
      debug: true,
    }),
    // new ParallelPlugin({ containers: ["#detail"] }),
  ],
});

const closeOverlay = () => {
  const closeLink = document.querySelector('a.character_close') as HTMLAnchorElement;
  if (closeLink) swup.visit(closeLink.href);
}

type OverlayComponent = AlpineComponent<{
  open: boolean;
}>

Alpine.data('overlay', (): OverlayComponent => ({
  open: true,
  bindings: {
    "x-on:scroll": "onScroll"
  },
  onScroll() {
    if (!this.open) return;
    if (!this.$refs.detail) return;
    const rect = this.$refs.detail.getBoundingClientRect();

    if (rect.bottom < 0) {
      this.open = false;
			closeOverlay();
    }
  }
}));

Alpine.start();

// swup.hooks.on("animation:out:start", async (context) => {
//   await sleep(20000);
// });

/**
 * Close eventual overlays using the Escape key
 */
const onKeyDown = (e: KeyboardEvent) => {
  if (e.metaKey) return;

  switch (e.key) {
    case "Escape":
      closeOverlay();
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
    appendTo: "parent"
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

  // ignore external links
  if (el.origin !== location.origin) return;

  // ignore anchor links
  if (el.getAttribute("href")?.startsWith("#")) return;

  // ignore links to same page
  if (
    swup.isSameResolvedUrl(
      Location.fromElement(el).url,
      Location.fromUrl(window.location.href).url
    )
  ) {
    return;
  }

  // Get the fragment plugin
  const fragmentPlugin = swup.findPlugin(
    "SwupFragmentPlugin"
  ) as FragmentPlugin;
  if (!fragmentPlugin) return;

  const fragmentVisit = fragmentPlugin.getFragmentVisit({
    from: Location.fromUrl(window.location.href).url,
    to: Location.fromElement(el).url,
  });

  showInternalLinkTooltip(
    el,
    fragmentVisit?.fragments?.map((selector) => selector) ||
      swup.options.containers
  );
};
// Delegate mouseenter
swup.delegateEvent(swup.options.linkSelector, "mouseenter", onHoverLink, {
  capture: true,
});

// Reset the scroll of the overlay when switching #detail
const onContentReplace: Handler<"content:replace"> = (context) => {
  const overlay = document.querySelector("#overlay") as HTMLElement | null;
  if (overlay) overlay.scrollTo({ top: 0, left: 0 });
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
