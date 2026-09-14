/* Ledgerly website behaviour: screenshot tabs, a lightbox, and the docs
 * table of contents. No framework -- the whole site is four files. */

(function () {
  "use strict";

  /* ---------- screenshot tabs ---------- */

  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab) {
    tabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected));
      const panel = document.getElementById(other.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      // Arrow keys move between tabs, which is what a screen reader user
      // and a keyboard user both expect of a tablist.
      const step = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: tabs.length - 1 - index }[
        event.key
      ];
      if (step === undefined) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- lightbox ---------- */

  const lightbox = document.getElementById("lightbox");

  if (lightbox && typeof lightbox.showModal === "function") {
    const picture = lightbox.querySelector("img");
    const close = lightbox.querySelector(".lightbox__close");

    document.querySelectorAll(".shot img, .paper img, .prose figure img").forEach((image) => {
      image.style.cursor = "zoom-in";
      image.addEventListener("click", () => {
        picture.src = image.currentSrc || image.src;
        picture.alt = image.alt;
        lightbox.showModal();
      });
    });

    close.addEventListener("click", () => lightbox.close());
    // Clicking the backdrop closes it; clicking the image itself must not.
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }

  /* ---------- documentation contents ---------- */

  const docsNav = document.querySelector(".docs__nav ol");

  if (docsNav) {
    const headings = Array.from(document.querySelectorAll(".prose h2[id]"));

    headings.forEach((heading) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      item.appendChild(link);
      docsNav.appendChild(item);
    });

    const links = new Map(
      Array.from(docsNav.querySelectorAll("a")).map((a) => [a.getAttribute("href").slice(1), a])
    );

    // Highlight whichever section is nearest the top of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = links.get(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((other) => other.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-88px 0px -72% 0px" }
    );

    headings.forEach((heading) => observer.observe(heading));
  }
})();
