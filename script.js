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

    const closeMenu = () => {
      if (!menu) return;
      menu.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    };

    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
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
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (!menu.contains(t) && !toggle.contains(t)) closeMenu();
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
        if (status) status.textContent = "";
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

  const runPageWires = () => {
    wireFooterYear();
    wireCopyPitch();
  };

  const injectNav = async () => {
    // Wire page features even if nav fails
    runPageWires();
    if (!navContainer) return;

    try {
      navContainer.classList.remove("nav-ready");

      // IMPORTANT:
      // Use a RELATIVE path so it works from /book.html, /ashes.html, etc.
      // This assumes your structure is:
      //   /partials/nav.html
      // and the page is in the root (index.html, book.html, etc.)
      const navUrl = `partials/nav.html?v=${Date.now()}`;

      const res = await fetch(navUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Nav fetch failed: ${res.status}`);

      const html = await res.text();
      navContainer.innerHTML = html;

      wireNavToggle();

      // Your CSS already handles active states via #siteNav[data-active="..."]
      // so we don't need to add an "active" class. Leaving this out avoids conflicts.

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
