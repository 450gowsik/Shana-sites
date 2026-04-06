// Extracted JS from index.html
// Scroll reveal
const fades = document.querySelectorAll(".fade");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);
fades.forEach((el) => io.observe(el));

// Stack filter
document.querySelectorAll(".stab").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    showStack(category, button);
  });
});

function showStack(cat, btn) {
  document
    .querySelectorAll(".stab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const panel = document.getElementById("stack-all");
  panel.style.display = "grid";
  panel.querySelectorAll(".spill").forEach((el) => {
    el.style.display =
      cat === "all" || el.dataset.cat === cat ? "flex" : "none";
  });
}

// Form (POST to backend)
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", submitForm);
}

async function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const subject =
    form.querySelector('input[placeholder^="Job opportunity"]').value ||
    "";
  const message = form.querySelector("textarea").value;
  try {
    const apiUrl = "/api/contact";
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });
    if (!res.ok) throw new Error("Network response was not ok");
    form.reset();
    document.getElementById("ok").style.display = "block";
  } catch (err) {
    alert("Sorry — could not send message right now.");
    console.error(err);
  }
}

// ─── Project Carousel (LinkedIn-style) ───
function slideProj(btn, dir) {
  const carousel = btn.closest(".proj-carousel");
  const track = carousel.querySelector(".proj-carousel-track");
  const images = track.querySelectorAll("img");
  const w = track.clientWidth;
  const currentIndex = Math.round(track.scrollLeft / w);
  let next = currentIndex + dir;
  if (next < 0) next = images.length - 1;
  if (next >= images.length) next = 0;
  track.scrollTo({ left: next * w, behavior: "smooth" });
  updateCarouselUI(carousel, next);
}

function updateCarouselUI(carousel, index) {
  // Update dots
  const dots = carousel.querySelectorAll(".proj-carousel-dot");
  dots.forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });
  // Update counter
  const counter = carousel.querySelector(".proj-carousel-counter .curr");
  if (counter) counter.textContent = index + 1;
}

// Dot click navigation
document.querySelectorAll(".proj-carousel-dot").forEach((dot, i) => {
  dot.addEventListener("click", () => {
    const carousel = dot.closest(".proj-carousel");
    const track = carousel.querySelector(".proj-carousel-track");
    const w = track.clientWidth;
    track.scrollTo({ left: i * w, behavior: "smooth" });
    updateCarouselUI(carousel, i);
  });
});

// Scroll-based dot tracking
document.querySelectorAll(".proj-carousel-track").forEach((track) => {
  track.addEventListener("scroll", () => {
    const carousel = track.closest(".proj-carousel");
    const w = track.clientWidth;
    const index = Math.round(track.scrollLeft / w);
    updateCarouselUI(carousel, index);
  });
});

// Full-screen image overlay
(function () {
  // Create overlay element
  const overlay = document.createElement("div");
  overlay.className = "proj-img-overlay";
  overlay.innerHTML = `
    <button class="close-btn">✕</button>
    <img src="" alt="Full view" />
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector("img");
  const closeBtn = overlay.querySelector(".close-btn");

  // Click on carousel images to zoom
  document.querySelectorAll(".proj-carousel-track img").forEach((img) => {
    img.addEventListener("click", () => {
      overlayImg.src = img.src;
      overlayImg.alt = img.alt;
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  // Close overlay
  function closeOverlay() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeOverlay();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlay();
  });
})();
