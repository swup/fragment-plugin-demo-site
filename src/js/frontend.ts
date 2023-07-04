export const isTouch = () => {
  return !window.matchMedia("(hover: hover)").matches;
};

/**
 * Sleep for a given amount of milliseconds
 */
export const sleep = (ms: number) => {
	return new Promise((res) => setTimeout(res, ms));
};