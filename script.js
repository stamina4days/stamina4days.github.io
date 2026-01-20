(() => {
  "use strict";

  const navContainer = document.getElementById("siteNav");

  const setActiveNavLink = () => {
    if (!navContainer) return;

    const activeKey = (navContainer.getAttribute("data-active") || "").trim();
    if (!activeKey) return;

    const link = navContainer.querySelector(`[data-nav="${activeKey}"]`);
    if (link) link.classList.add("active");
  };

  const wireNavToggle = () => {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");

    const closeMenu = () => {
      if (!menu) return;
      menu.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    };

    if (toggle && menu) {
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
    }
  };

  const wireFooterYear = () => {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  };

  const wireCopyPitch = () => {
    const copyBtn = document.getElementById("copyPitch");
    const status = document.getElementById("copyStatus");
    if (!copyBtn) return;

    copyBtn.addEventListener("click", async () => {
      const pitch =
        "A quiet, escalating record of what happens when observation stops being neutral—and becomes a force.";

      const setStatus = (msg) => {
        if (!status) return;
        status.textContent = msg;
        window.clearTimeout(setStatus._t);
        setStatus._t = window.setTimeout(() => {
          if (status) status.textContent = "";
        }, 1200);
      };

      try {
        await navigator.clipboard.writeText(pitch);
        setStatus("Copied.");
      } catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = pitch;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setStatus("Copied.");
        } catch {
          setStatus("Copy failed. Select and copy manually.");
        }
      }
    });
  };

  const injectNav = async () => {
    if (!navContainer) return;

    try {
      // ensure hidden state before injection (so fade actually happens)
      navContainer.classList.remove("nav-ready");

      const res = await fetch("/partials/nav.html", { cache: "no-store" });
      if (!res.ok) throw new Error(`Nav fetch failed: ${res.status}`);

      const html = await res.text();
      navContainer.innerHTML = html;

      // Now that it's in the DOM, wire it up
      wireNavToggle();
      setActiveNavLink();

      // Safe to run anytime
      wireFooterYear();
      wireCopyPitch();

      // Trigger fade in on next frame
      requestAnimationFrame(() => {
        navContainer.classList.add("nav-ready");
      });
    } catch (err) {
      console.warn(err);

      // Even if nav fails, still do these
      wireFooterYear();
      wireCopyPitch();
    }
  };

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNav);
  } else {
    injectNav();
  }
})();