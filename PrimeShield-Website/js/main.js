"use strict";

/* PrimeShield Solutions — production-ready interactions */
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const navbar = document.getElementById("psNavbar");
    const nav = document.getElementById("psNav");
    const menuButton = document.getElementById("psMenuButton");
    const navLinks = [...document.querySelectorAll(".ps-navbar__link")];
    const backTop = document.querySelector(".back-to-top");
    const form = document.getElementById("estimateForm");
    const popup = document.getElementById("successPopup");
    const closePopup = document.getElementById("closePopup");
    const year = document.getElementById("currentYear");
    const preferredDate = document.getElementById("preferredDate");

    if (year) year.textContent = String(new Date().getFullYear());
    if (preferredDate) preferredDate.min = new Date().toISOString().split("T")[0];

    if (typeof AOS !== "undefined") {
        AOS.init({ duration: 900, once: true, offset: 80 });
    }

    const closeMenu = () => {
        if (!nav || !menuButton) return;
        nav.classList.remove("open");
        menuButton.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
    };

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            const opening = !nav.classList.contains("open");
            nav.classList.toggle("open", opening);
            menuButton.classList.toggle("open", opening);
            menuButton.setAttribute("aria-expanded", String(opening));
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const selector = link.getAttribute("href");
            if (!selector || selector === "#") return;
            const target = document.querySelector(selector);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            closeMenu();
        });
    });

    const sections = [...document.querySelectorAll("section[id]")];
    const updateOnScroll = () => {
        const scrolled = window.scrollY > 40;
        if (navbar) navbar.classList.toggle("scrolled", scrolled);
        if (backTop) backTop.classList.toggle("show", window.scrollY > 600);

        let currentId = "home";
        sections.forEach((section) => {
            if (window.scrollY >= section.offsetTop - 180) currentId = section.id;
        });
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
        });
    };
    updateOnScroll();
    window.addEventListener("scroll", updateOnScroll, { passive: true });

    if (backTop) {
        backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    document.querySelectorAll("[data-counter]").forEach((counter) => {
        const target = Number(counter.dataset.counter || 0);
        const suffix = counter.dataset.suffix || "";
        let started = false;
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting || started) return;
            started = true;
            const startedAt = performance.now();
            const duration = 1100;
            const tick = (now) => {
                const progress = Math.min((now - startedAt) / duration, 1);
                counter.textContent = `${Math.round(target * progress)}${suffix}`;
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
        }, { threshold: 0.45 });
        observer.observe(counter);
    });

    document.querySelectorAll(".ps-comparison__viewer").forEach((viewer) => {
        let dragging = false;
        const update = (clientX) => {
            const rect = viewer.getBoundingClientRect();
            const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
            viewer.style.setProperty("--comparison-position", `${(x / rect.width) * 100}%`);
        };
        viewer.addEventListener("pointerdown", (event) => {
            dragging = true;
            viewer.setPointerCapture(event.pointerId);
            update(event.clientX);
        });
        viewer.addEventListener("pointermove", (event) => dragging && update(event.clientX));
        viewer.addEventListener("pointerup", () => { dragging = false; });
        viewer.addEventListener("pointercancel", () => { dragging = false; });
    });

    const hidePopup = () => {
        if (!popup) return;
        popup.classList.remove("show");
        popup.setAttribute("aria-hidden", "true");
    };
    if (closePopup) closePopup.addEventListener("click", hidePopup);
    if (popup) popup.addEventListener("click", (event) => { if (event.target === popup) hidePopup(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") hidePopup(); });

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;
            const original = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>Sending…</span><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';

            const payload = {
                fullName: document.getElementById("fullName")?.value.trim() || "",
                phone: document.getElementById("phone")?.value.trim() || "",
                email: document.getElementById("email")?.value.trim() || "",
                service: document.getElementById("service")?.value || "",
                propertyType: document.getElementById("propertyType")?.value || "",
                preferredDate: preferredDate?.value || "Not specified",
                address: document.getElementById("address")?.value.trim() || "Not specified",
                message: document.getElementById("message")?.value.trim() || ""
            };

            try {
                if (typeof emailjs === "undefined") throw new Error("Email service is unavailable.");
                await emailjs.send("service_9m57xus", "template_c1y2g9n", payload);
                form.reset();
                if (preferredDate) preferredDate.min = new Date().toISOString().split("T")[0];
                if (popup) {
                    popup.classList.add("show");
                    popup.setAttribute("aria-hidden", "false");
                    closePopup?.focus();
                    window.setTimeout(hidePopup, 5000);
                }
            } catch (error) {
                console.error("EmailJS error:", error);
                window.alert("We could not send your request. Please call (905) 324-2265 or email infoprimeshieldsolutions@gmail.com.");
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = original;
            }
        });
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        gsap.from(".ps-hero__content > *", { opacity: 0, y: 35, duration: 0.8, stagger: 0.12, ease: "power3.out" });
        gsap.utils.toArray(".ps-service-card").forEach((card) => {
            gsap.from(card, { scrollTrigger: { trigger: card, start: "top 88%" }, opacity: 0, y: 45, duration: 0.7, ease: "power3.out" });
        });
    }
});

window.addEventListener("load", () => {
    const loader = document.getElementById("psLoader");
    if (!loader) return;
    window.setTimeout(() => {
        loader.classList.add("hidden");
        document.body.classList.remove("loading");
        document.body.classList.add("loaded");
    }, 900);
});
