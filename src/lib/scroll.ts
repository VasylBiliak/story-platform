/**
 * Smooth scroll utility that accounts for fixed header height
 * Prevents content from being hidden behind the header after scroll
 */
export function scrollToWithOffset(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const header = document.querySelector("header");
  const headerHeight = header?.getBoundingClientRect().height || 0;

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - headerHeight - 8; // 8px extra padding

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
}
