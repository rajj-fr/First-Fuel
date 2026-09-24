/* FIRST FUEL — cinematic trailer + ecommerce */

const heroTrailer = document.getElementById("heroTrailer");

if (heroTrailer) {
  heroTrailer.muted = true;
  heroTrailer.playsInline = true;

  /*
    FIRST FUEL name:
    Trailer ke 30% point par ek baar fade out hoga.
    Video loop hone ke baad bhi wapas show nahi hoga.
  */
  const heroBrandName = document.getElementById("heroBrandName");
  let trailerNameHidden = false;

  function checkTrailerProgress() {
    if (trailerNameHidden || !heroBrandName) return;

    if (
      Number.isFinite(heroTrailer.duration) &&
      heroTrailer.duration > 0 &&
      heroTrailer.currentTime >= heroTrailer.duration * 0.30
    ) {
      trailerNameHidden = true;
      heroBrandName.classList.add("trailer-name-hidden");

      heroTrailer.removeEventListener(
        "timeupdate",
        checkTrailerProgress
      );
    }
  }

  heroTrailer.addEventListener(
    "timeupdate",
    checkTrailerProgress
  );

  heroTrailer.addEventListener(
    "loadedmetadata",
    checkTrailerProgress
  );

  function playTrailer() {
    heroTrailer.muted = true;

    const promise = heroTrailer.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  }

  heroTrailer.addEventListener(
    "loadeddata",
    playTrailer,
    { once: true }
  );

  heroTrailer.addEventListener(
    "canplay",
    playTrailer,
    { once: true }
  );

  window.addEventListener(
    "load",
    playTrailer,
    { once: true }
  );

  setTimeout(playTrailer, 500);
}


/* Remove old startup loader immediately */

const loader = document.getElementById("loader");

if (loader) {
  requestAnimationFrame(() => {
    loader.classList.add("hide");
  });

  setTimeout(() => {
    loader.remove();
  }, 900);
}


/* =========================
   ECOMMERCE
========================= */

const PRODUCTS = {
  original: {
    name: "Original",
    price: 189,
    image: "images/original.jpg.jpeg"
  },

  "sour-apple": {
    name: "Sour Apple",
    price: 189,
    image: "images/sour-apple.jpg.jpeg"
  },

  citrus: {
    name: "Citrus",
    price: 189,
    image: "images/citrus.jpg.jpeg"
  },

  "wild-berry": {
    name: "Wild Berry",
    price: 189,
    image: "images/wild-berry.jpg.jpeg"
  }
};

let cart = JSON.parse(
  localStorage.getItem("firstFuelCart") || "{}"
);

const money = n =>
  `₹${n.toLocaleString("en-IN")}`;

function saveCart() {
  localStorage.setItem(
    "firstFuelCart",
    JSON.stringify(cart)
  );

  renderCart();
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;

  saveCart();

  showToast(
    `${PRODUCTS[id].name.toUpperCase()} ADDED TO BAG`
  );
}

function renderCart() {
  const wrap = document.getElementById("cartItems");

  const count = Object.values(cart)
    .reduce((a, b) => a + b, 0);

  document.getElementById("cartCount").textContent = count;

  wrap.innerHTML = "";

  let subtotal = 0;

  Object.entries(cart).forEach(([id, qty]) => {
    const p = PRODUCTS[id];

    subtotal += p.price * qty;

    wrap.insertAdjacentHTML(
      "beforeend",
      `
      <div class="cart-item">

        <img
          src="${p.image}"
          alt="${p.name}"
        >

        <div>
          <h4>${p.name}</h4>

          <p>
            ${money(p.price)} · 250 ML
          </p>

          <div class="qty">

            <button
              data-qty="${id}"
              data-change="-1"
            >
              −
            </button>

            <span>${qty}</span>

            <button
              data-qty="${id}"
              data-change="1"
            >
              +
            </button>

          </div>
        </div>

        <button
          class="remove"
          data-remove="${id}"
        >
          REMOVE
        </button>

      </div>
      `
    );
  });

  if (!Object.keys(cart).length) {
    wrap.innerHTML = `
      <div
        style="
          color:#666;
          padding:30px 0;
          font-size:13px
        "
      >
        Your bag is empty.
        Choose your fuel from the shop.
      </div>
    `;
  }

  document.getElementById(
    "cartSubtotal"
  ).textContent = money(subtotal);

  document.getElementById(
    "cartShipping"
  ).textContent =
    subtotal
      ? "CALCULATED AT CHECKOUT"
      : "—";

  document.getElementById(
    "cartTotal"
  ).textContent = money(subtotal);
}


/* =========================
   CLICK EVENTS
========================= */

document.addEventListener("click", e => {

  const add = e.target.closest("[data-add]");

  if (add) {
    addToCart(add.dataset.add);
    return;
  }


  const q = e.target.closest("[data-qty]");

  if (q) {

    const id = q.dataset.qty;

    cart[id] =
      (cart[id] || 0) +
      Number(q.dataset.change);

    if (cart[id] <= 0) {
      delete cart[id];
    }

    saveCart();

    return;
  }


  const rem = e.target.closest("[data-remove]");

  if (rem) {

    delete cart[rem.dataset.remove];

    saveCart();

    return;
  }


  const quick =
    e.target.closest(".quick-view");

  if (quick) {

    openProduct(
      quick.dataset.product
    );

    return;
  }


  const modalBtn =
    e.target.closest("[data-modal]");

  if (modalBtn) {

    openModal(
      modalBtn.dataset.modal
    );

    return;
  }

});


/* =========================
   PRODUCT MODAL
========================= */

function openProduct(id) {

  const p = PRODUCTS[id];

  openCustomModal(
    p.name,

    `
      <img
        src="${p.image}"
        alt="${p.name}"
        style="
          width:100%;
          aspect-ratio:1/1;
          object-fit:cover;
          background:#111
        "
      >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-top:18px
        "
      >

        <div>
          <p
            style="
              margin:0;
              color:#888
            "
          >
            250 ML
          </p>

          <strong
            style="font-size:20px"
          >
            ${money(p.price)}
          </strong>
        </div>

        <button
          class="primary-btn"
          onclick="
            addToCart('${id}');
            closeModal()
          "
        >
          ADD TO BAG <span>↗</span>
        </button>

      </div>
    `
  );
}


/* =========================
   MODALS
========================= */

const modalData = {

  "order-support": [
    "ORDER SUPPORT",

    `
      <p>
        Use the form below for order questions.
        In production, connect this form to your
        support backend.
      </p>

      <div class="form-grid">

        <input placeholder="Order ID">

        <input
          type="email"
          placeholder="Email address"
        >

        <textarea
          placeholder="Describe the issue"
        ></textarea>

        <button
          class="primary-btn"
          onclick="
            showToast('SUPPORT REQUEST READY');
            closeModal()
          "
        >
          SUBMIT REQUEST <span>↗</span>
        </button>

      </div>
    `
  ],

  shipping: [
    "SHIPPING & DELIVERY",

    `
      <p>
        FIRST FUEL ships within India.
        Estimated delivery is 4–7 days
        after dispatch.
      </p>

      <p>
        Shipping is not free by default
        and the final charge should be
        calculated by the production checkout.
      </p>
    `
  ],

  cod: [
    "COD INFORMATION",

    `
      <p>
        Cash on Delivery is planned for
        eligible Indian delivery addresses.
      </p>
    `
  ],

  returns: [
    "RETURNS & REFUNDS",

    `
      <p>
        Returns and refunds should be
        governed by the final production
        policy shown at checkout.
      </p>
    `
  ],

  faq: [
    "FAQ",

    `
      <p>
        <strong>Price:</strong>
        ₹189 / 250 ML can.
      </p>

      <p>
        <strong>Delivery:</strong>
        India only, estimated 4–7 days.
      </p>

      <p>
        <strong>Support:</strong>
        rajolds7@gmail.com
        or Instagram @newhuuyrr_.
      </p>
    `
  ],

  contact: [
    "CONTACT US",

    `
      <p>
        Email:
        <a href="mailto:rajolds7@gmail.com">
          rajolds7@gmail.com
        </a>
      </p>

      <p>
        Instagram: @newhuuyrr_
      </p>
    `
  ],

  privacy: [
    "PRIVACY POLICY",

    `
      <p>
        This demo policy is a production placeholder.
      </p>
    `
  ],

  terms: [
    "TERMS & CONDITIONS",

    `
      <p>
        Demo placeholder for the final legal terms.
      </p>
    `
  ],

  "shipping-policy": [
    "SHIPPING POLICY",

    `
      <p>
        India only.
        Estimated delivery: 4–7 days.
      </p>
    `
  ],

  "refund-policy": [
    "REFUND & CANCELLATION POLICY",

    `
      <p>
        Demo placeholder.
      </p>
    `
  ],

  cookies: [
    "COOKIE POLICY",

    `
      <p>
        Demo placeholder.
      </p>
    `
  ]
};


function openModal(key) {

  const data = modalData[key];

  if (data) {
    openCustomModal(
      data[0],
      data[1]
    );
  }
}


function openCustomModal(title, body) {

  document.getElementById(
    "modalEyebrow"
  ).textContent = "FIRST FUEL";

  document.getElementById(
    "modalTitle"
  ).textContent = title;

  document.getElementById(
    "modalBody"
  ).innerHTML = body;

  document.getElementById(
    "modalBackdrop"
  ).classList.add("open");

  document.body.style.overflow = "hidden";
}


function closeModal() {

  document.getElementById(
    "modalBackdrop"
  ).classList.remove("open");

  document.body.style.overflow = "";
}


/* =========================
   CART
========================= */

document.getElementById(
  "modalClose"
).onclick = closeModal;


document.getElementById(
  "modalBackdrop"
).addEventListener(
  "click",
  e => {

    if (
      e.target.id ===
      "modalBackdrop"
    ) {
      closeModal();
    }

  }
);


document.getElementById(
  "cartOpen"
).onclick = () =>
  document
    .getElementById("cartDrawer")
    .classList.add("open");


document.getElementById(
  "cartClose"
).onclick = () =>
  document
    .getElementById("cartDrawer")
    .classList.remove("open");


document.getElementById(
  "checkoutBtn"
).onclick = () => {

  if (!Object.keys(cart).length) {

    showToast(
      "YOUR BAG IS EMPTY"
    );

    return;
  }

  openCustomModal(
    "CHECKOUT READY",

    `
      <p>
        Your cart is ready for
        the production checkout.
      </p>

      <p>
        This current site is a front-end demo.
      </p>

      <button
        class="primary-btn full"
        onclick="closeModal()"
      >
        CLOSE <span>×</span>
      </button>
    `
  );
};


function showToast(msg) {

  const t =
    document.getElementById("toast");

  t.textContent = msg;

  t.classList.add("show");

  clearTimeout(
    window.toastTimer
  );

  window.toastTimer =
    setTimeout(
      () =>
        t.classList.remove("show"),
      1800
    );
}


renderCart();
