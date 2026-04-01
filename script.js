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
// Detect when file is served from a different dev server (eg. Live Server on :5500)
// Use the Express backend on port 3000 in that case; otherwise use same-origin path.
const apiBase =
  location.port && location.port !== "3000"
    ? "http://localhost:3000"
    : "";
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
    const apiUrl = apiBase + "/api/contact";
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
