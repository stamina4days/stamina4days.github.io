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

    const closeMenu = () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };

    // Toggle open/close
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when clicking a link
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menu.classList.contains("open")) return;

      const target = e.target;
      // Guard for weird environments (and SVG clicks)
      if (!target || typeof target !== "object") return;

      // Use closest when possible (safe + fast)
      const clickedToggle =
        typeof target.closest === "function" && target.closest("#navToggle");
      const clickedMenu =
        typeof target.closest === "function" && target.closest("#navMenu");

      // If closest isn't available, fallback to contains()
      const isInsideToggle = clickedToggle || toggle.contains(target);
      const isInsideMenu = clickedMenu || menu.contains(target);

      if (!isInsideMenu && !isInsideToggle) closeMenu();
    });

    // Close menu on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
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
      // Modern clipboard path
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(pitch);
          setStatus("Copied.");
          return;
        }
      } catch {
        // fall through
      }

      // Legacy fallback
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

  // Scroll-activated "classified record" treatment
  const wireClassifiedReveal = () => {
    const targets = document.querySelectorAll("[data-classified]");
    if (!targets.length) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // If user prefers reduced motion, just mark revealed (no animation fuss)
    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    // No IO support? Reveal immediately
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
        rootMargin: "0px 0px -10% 0px", // triggers a bit earlier, feels smoother
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
    // Wire page features even if nav fails
    runPageWires();
    if (!navContainer) return;

    try {
      navContainer.classList.remove("nav-ready");

      // Relative path + cache-bust for GitHub Pages
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
