// Mobile nav toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        panel.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // Registration modal (shared by Driving School license rows and
  // Computer College course cards) — opens on click, pre-selects the
  // relevant course/class, and hands off to WhatsApp on submit.
  const regModal = initRegModal();

  function initRegModal() {
    const overlay = document.getElementById("regModalOverlay");
    if (!overlay) return null;

    const closeBtn = document.getElementById("regModalClose");
    const form = document.getElementById("regForm");
    const courseSelect = document.getElementById("regCourse");
    const waNumber = overlay.getAttribute("data-wa-number");
    const waGreeting = overlay.getAttribute("data-wa-greeting");

    function open(courseName) {
      if (courseName && courseSelect) {
        const match = Array.from(courseSelect.options).find(
          (opt) => opt.value && opt.value.toLowerCase() === courseName.trim().toLowerCase()
        );
        courseSelect.value = match ? match.value : "";
      }
      overlay.classList.add("open");
      document.body.classList.add("reg-modal-lock");
    }

    function close() {
      overlay.classList.remove("open");
      document.body.classList.remove("reg-modal-lock");
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value.trim();
      const phone = document.getElementById("regPhone").value.trim();
      const course = courseSelect.value;

      const lines = [waGreeting, `Name: ${name}`, `Phone: ${phone}`, `Course: ${course}`];
      const text = encodeURIComponent(lines.join("\n"));
      const url = `https://wa.me/${waNumber}?text=${text}`;
      window.open(url, "_blank", "noopener");
      close();
      form.reset();
    });

    return { open, close };
  }

  // Inquiry modal (Logistics page) — a single service-aware quote form.
  // Selecting a service reveals only the fields relevant to it (vehicle
  // type, dates, locations, passengers, driver requirement, etc.), and
  // submission hands off to WhatsApp with only the filled-in fields.
  initInquiryModal();

  function initInquiryModal() {
    const overlay = document.getElementById("inquiryModalOverlay");
    if (!overlay) return;

    const closeBtn = document.getElementById("inquiryModalClose");
    const form = document.getElementById("inquiryForm");
    const serviceSelect = document.getElementById("inqService");
    const vehicleSelect = document.getElementById("inqVehicle");
    const fieldGroups = Array.from(form.querySelectorAll(".inq-field"));
    const waNumber = overlay.getAttribute("data-wa-number");
    const waGreeting = overlay.getAttribute("data-wa-greeting");

    function refreshFields() {
      const service = serviceSelect.value;
      fieldGroups.forEach((group) => {
        const allowed = (group.getAttribute("data-fields") || "").split(",");
        group.classList.toggle("hidden", !allowed.includes(service));
      });
    }

    function open(service, vehicle) {
      form.reset();
      refreshFields();
      if (service) {
        const match = Array.from(serviceSelect.options).find(
          (opt) => opt.value && opt.value.toLowerCase() === service.trim().toLowerCase()
        );
        serviceSelect.value = match ? match.value : "";
        refreshFields();
      }
      if (vehicle && vehicleSelect) {
        const match = Array.from(vehicleSelect.options).find(
          (opt) => opt.value && opt.value.toLowerCase() === vehicle.trim().toLowerCase()
        );
        vehicleSelect.value = match ? match.value : "";
      }
      overlay.classList.add("open");
      document.body.classList.add("reg-modal-lock");
    }

    function close() {
      overlay.classList.remove("open");
      document.body.classList.remove("reg-modal-lock");
    }

    serviceSelect.addEventListener("change", refreshFields);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const val = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
      };

      const service = serviceSelect.value;
      const lines = [waGreeting, "", `Service: ${service}`];

      const maybeAdd = (label, value) => {
        if (value) lines.push(`${label}: ${value}`);
      };

      maybeAdd("Vehicle type", val("inqVehicle"));
      maybeAdd("Date needed", val("inqDate"));
      maybeAdd("Duration", val("inqDuration"));
      maybeAdd("Pick-up location", val("inqPickup"));
      maybeAdd("Drop-off location", val("inqDropoff"));
      maybeAdd("Passengers", val("inqPassengers"));
      maybeAdd("Driver required", val("inqDriver"));
      maybeAdd("Drivers needed", val("inqNumDrivers"));
      maybeAdd("Special requirements", val("inqNotes"));

      lines.push("", `Name: ${val("inqName")}`, `Phone: ${val("inqPhone")}`);

      const text = encodeURIComponent(lines.join("\n"));
      const url = `https://wa.me/${waNumber}?text=${text}`;
      window.open(url, "_blank", "noopener");
      close();
      form.reset();
    });

    // Any element on the page marked data-open-inquiry launches this modal,
    // optionally pre-selecting a service (data-inquiry-service) and/or
    // vehicle type (data-inquiry-vehicle).
    document.querySelectorAll("[data-open-inquiry]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        open(trigger.getAttribute("data-inquiry-service"), trigger.getAttribute("data-inquiry-vehicle"));
      });
    });
  }

  // Driving School: clicking a license-class row opens the registration
  // modal with that class pre-selected.
  const licenseBody = document.getElementById("licenseTableBody");
  if (licenseBody && regModal) {
    licenseBody.addEventListener("click", (e) => {
      const row = e.target.closest(".reg-row");
      if (!row) return;
      regModal.open(row.getAttribute("data-course"));
    });
  }

  // Course catalog (computer college page): track filter + live search +
  // "show 6 then load more" pagination + per-card details toggle
  initCourseCatalog();

  function initCourseCatalog() {
    const grid = document.getElementById("courseGrid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".course-card"));
    const filterBtns = document.querySelectorAll("[data-filter]");
    const searchInput = document.getElementById("courseSearch");
    const loadMoreBtn = document.getElementById("courseLoadMore");
    const noResults = document.getElementById("courseNoResults");
    const countEl = document.getElementById("courseCount");

    const INITIAL_LIMIT = 6;
    let currentTrack = "all";
    let searchTerm = "";
    let expanded = false;

    function render() {
      const term = searchTerm.trim().toLowerCase();
      let visibleCount = 0;
      let matchCount = 0;

      cards.forEach((card) => {
        const track = card.getAttribute("data-track");
        const name = card.getAttribute("data-name") || "";
        const trackMatch = currentTrack === "all" || track === currentTrack;
        const searchMatch = term === "" || name.includes(term);
        const isMatch = trackMatch && searchMatch;

        if (!isMatch) {
          card.style.display = "none";
          return;
        }

        matchCount++;
        const withinLimit = term !== "" || expanded || matchCount <= INITIAL_LIMIT;
        card.style.display = withinLimit ? "" : "none";
        if (withinLimit) visibleCount++;
      });

      // "Load more" only makes sense when not actively searching
      const hasMoreToShow = term === "" && matchCount > INITIAL_LIMIT;
      if (loadMoreBtn) {
        loadMoreBtn.style.display = hasMoreToShow ? "" : "none";
        loadMoreBtn.textContent = expanded ? "Show fewer courses" : `Show all ${matchCount} courses`;
      }

      if (noResults) noResults.style.display = matchCount === 0 ? "" : "none";
      if (countEl) {
        countEl.textContent =
          matchCount === 0 ? "" : `Showing ${visibleCount} of ${matchCount} course${matchCount === 1 ? "" : "s"}`;
      }
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentTrack = btn.getAttribute("data-filter");
        expanded = false;
        render();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchTerm = searchInput.value;
        render();
      });
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        expanded = !expanded;
        render();
        if (!expanded) grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    // Per-card "More details" toggle (event delegation)
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".course-details-toggle");
      if (!btn) return;
      const desc = btn.nextElementSibling;
      const label = btn.querySelector(".label");
      const isOpen = desc.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (label) label.textContent = isOpen ? "Less details" : "More details";
    });

    // Clicking anywhere else on a course card opens the registration modal
    // with that course pre-selected (the "More details" toggle above is
    // excluded so the two interactions never fight each other).
    if (regModal) {
      grid.addEventListener("click", (e) => {
        if (e.target.closest(".course-details-toggle")) return;
        const card = e.target.closest(".course-card");
        if (!card) return;
        const title = card.querySelector("h3").textContent.trim();
        regModal.open(title);
      });
    }

    render();
  }

  // Segment tabs (logistics: personal vs organizational hire)
  const segTabs = document.querySelectorAll("[data-segment]");
  const segPanels = document.querySelectorAll("[data-segment-panel]");
  if (segTabs.length && segPanels.length) {
    segTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        segTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const seg = tab.getAttribute("data-segment");
        segPanels.forEach((p) => {
          p.classList.toggle("active", p.getAttribute("data-segment-panel") === seg);
        });
      });
    });
  }

  // Rotating hero CTA (hub page): auto-swaps between "Explore Driving
  // School" / "Explore Computer College" / "Explore Logistics" with a
  // soft slide-fade and a matching color shift per division.
  const rotateBtn = document.getElementById("heroRotateCta");
  const rotateInner = document.getElementById("heroRotateCtaInner");
  if (rotateBtn && rotateInner) {
    const items = [
      { label: "Explore Driving School", href: "driving/index.html", icon: "🚗", theme: "theme-driving" },
      { label: "Explore Computer College", href: "college/index.html", icon: "💻", theme: "theme-college" },
      { label: "Explore Logistics", href: "logistics/index.html", icon: "🚐", theme: "theme-logistics" },
    ];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;

    function apply(i) {
      const item = items[i];
      rotateInner.innerHTML = `<span class="rotate-cta-icon">${item.icon}</span>${item.label}`;
      rotateBtn.href = item.href;
      rotateBtn.classList.remove("theme-driving", "theme-college", "theme-logistics");
      rotateBtn.classList.add(item.theme);
    }

    function next() {
      index = (index + 1) % items.length;
      if (prefersReducedMotion) {
        apply(index);
        return;
      }
      rotateInner.classList.add("swap-out");
      setTimeout(() => {
        apply(index);
        rotateInner.classList.remove("swap-out");
        rotateInner.classList.add("swap-in");
        requestAnimationFrame(() => rotateInner.classList.remove("swap-in"));
      }, 380);
    }

    apply(0);
    if (!prefersReducedMotion) {
      setInterval(next, 2800);
    }
  }

  // Auto-rotating photo carousels (Driving School "Facilities" section,
  // Computer College "Inside the Classroom" section, or any element
  // matching [data-carousel])
  document.querySelectorAll("[data-carousel]").forEach(initPhotoCarousel);

  // Full-bleed hero background slideshow (home page) — crossfades between
  // slides showing the group's different services. Static on the first
  // slide for people who prefer reduced motion.
  document.querySelectorAll("[data-hero-bg]").forEach(initHeroBackground);

  function initHeroBackground(root) {
    const slides = Array.from(root.querySelectorAll(".hero-bg-slide"));
    if (slides.length < 2) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return; // leave the first slide showing, no rotation

    const intervalMs = parseInt(root.getAttribute("data-interval"), 10) || 5000;
    let index = slides.findIndex((s) => s.classList.contains("active"));
    if (index < 0) index = 0;

    setInterval(() => {
      slides[index].classList.remove("active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, intervalMs);
  }

  function initPhotoCarousel(root) {
    const track = root.querySelector(".photo-carousel-track");
    const slides = Array.from(root.querySelectorAll(".photo-carousel-slide"));
    if (!track || slides.length < 2) return; // nothing to rotate

    const dotsWrap = root.querySelector(".photo-carousel-dots");
    const prevBtn = root.querySelector(".photo-carousel-arrow.prev");
    const nextBtn = root.querySelector(".photo-carousel-arrow.next");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intervalMs = parseInt(root.getAttribute("data-interval"), 10) || 4500;

    let index = 0;
    let timer = null;
    let hovering = false;

    const dots = slides.map((_, i) => {
      if (!dotsWrap) return null;
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show photo ${i + 1}`);
      dot.addEventListener("click", () => {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, i) => s.setAttribute("aria-hidden", i === index ? "false" : "true"));
      dots.forEach((d, i) => d && d.classList.toggle("active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function start() {
      if (prefersReducedMotion || hovering) return;
      stop();
      timer = setInterval(next, intervalMs);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    if (nextBtn) nextBtn.addEventListener("click", () => { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); restart(); });
    root.addEventListener("mouseenter", () => { hovering = true; stop(); });
    root.addEventListener("mouseleave", () => { hovering = false; start(); });

    render();
    start();
  }
});
