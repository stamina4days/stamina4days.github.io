(() => {
  "use strict";

  const navContainer = document.getElementById("siteNav");

  const wireFooterYear = () => {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  };

  const wireNavToggle = () => {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;

    const isOpen = () => menu.classList.contains("open");

    const closeMenu = () => {
      if (!isOpen()) return;
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      if (isOpen()) return;
      menu.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    };

    const toggleMenu = () => {
      if (isOpen()) closeMenu();
      else openMenu();
    };

    // Toggle open or close
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // If the toggle is focused and user presses Enter or Space
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      }
    });

    // Close menu when clicking a link
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Close menu when clicking or tapping outside
    // Use capture so it runs early and is consistent on mobile
    document.addEventListener(
      "click",
      (e) => {
        if (!isOpen()) return;

        const target = e.target;
        if (!target || typeof target !== "object") return;

        const clickedToggle =
          typeof target.closest === "function" && target.closest("#navToggle");
        const clickedMenu =
          typeof target.closest === "function" && target.closest("#navMenu");

        const insideToggle = clickedToggle || toggle.contains(target);
        const insideMenu = clickedMenu || menu.contains(target);

        if (!insideMenu && !insideToggle) closeMenu();
      },
      true
    );

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Close on scroll so it cannot sit over the page
    // Passive for performance
    window.addEventListener(
      "scroll",
      () => {
        closeMenu();
      },
      { passive: true }
    );

    // Close on resize or orientation change
    window.addEventListener("resize", closeMenu, { passive: true });
    window.addEventListener("orientationchange", closeMenu, { passive: true });

    // Defensive: if focus moves away and the menu is open, close it
    document.addEventListener("focusin", (e) => {
      if (!isOpen()) return;
      const target = e.target;
      if (!target || typeof target !== "object") return;
      const insideMenu = menu.contains(target);
      const insideToggle = toggle.contains(target);
      if (!insideMenu && !insideToggle) closeMenu();
    });
  };

  const wireCopyPitch = () => {
    const copyBtn = document.getElementById("copyPitch");
    const status = document.getElementById("copyStatus");
    if (!copyBtn) return;

    // No em dashes
    const pitch =
      "A quiet, escalating record of what happens when observation stops being neutral and becomes a force.";

    let tId = null;
    const setStatus = (msg) => {
      if (!status) return;
      status.textContent = msg;
      if (tId) window.clearTimeout(tId);
      tId = window.setTimeout(() => {
        status.textContent = "";
      }, 1200);
    };

    copyBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(pitch);
          setStatus("Copied.");
          return;
        }
      } catch {
        // fall through
      }

      try {
        const ta = document.createElement("textarea");
        ta.value = pitch;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setStatus("Copied.");
      } catch {
        setStatus("Copy failed. Select and copy manually.");
      }
    });
  };

  // Scroll activated "classified record" treatment
  const wireClassifiedReveal = () => {
    const targets = document.querySelectorAll("[data-classified]");
    if (!targets.length) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    targets.forEach((el) => io.observe(el));
  };

  const runPageWires = () => {
    wireFooterYear();
    wireCopyPitch();
    wireClassifiedReveal();
  };

  const injectNav = async () => {
    runPageWires();
    if (!navContainer) return;

    try {
      navContainer.classList.remove("nav-ready");

      // Cache bust for GitHub Pages
      const navUrl = `partials/nav.html?v=${Date.now()}`;

      const res = await fetch(navUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Nav fetch failed: ${res.status}`);

      navContainer.innerHTML = await res.text();

      // Now that nav exists, wire nav interactions
      wireNavToggle();

      requestAnimationFrame(() => {
        navContainer.classList.add("nav-ready");
      });
    } catch (err) {
      console.warn(err);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNav);
  } else {
    injectNav();
  }
})();
