/* =========================================================
   FIRST FUEL
   Trailer + Ecommerce
   ========================================================= */


/* =========================================================
   CINEMATIC TRAILER
   ========================================================= */

const heroTrailer = document.getElementById("heroTrailer");
const heroOverlay = document.getElementById("heroOverlay");
const scrollIndicator = document.getElementById("scrollIndicator");

let trailerTextHidden = false;


/*
  Hide ALL hero text permanently once trailer reaches 30%.
  This includes:
  - ENERGY DRINK
  - FIRST FUEL
  - MORE ENERGY. BIGGER YOU.
*/

function checkTrailerProgress(){

  if(trailerTextHidden){
    return;
  }

  if(
    heroTrailer &&
    Number.isFinite(heroTrailer.duration) &&
    heroTrailer.duration > 0
  ){

    const progress =
      heroTrailer.currentTime /
      heroTrailer.duration;

    if(progress >= 0.30){

      trailerTextHidden = true;

      if(heroOverlay){
        heroOverlay.classList.add(
          "trailer-name-hidden"
        );
      }

      if(scrollIndicator){
        scrollIndicator.style.opacity = "0";
      }

      /*
        Important:
        We DO NOT reset trailerTextHidden on loop.
        So when the video starts again,
        the text will remain hidden.
      */

      heroTrailer.removeEventListener(
        "timeupdate",
        checkTrailerProgress
      );
    }
  }
}


/*
  Trailer autoplay helper
*/

function startTrailer(){

  if(!heroTrailer){
    return;
  }

  heroTrailer.muted = true;
  heroTrailer.playsInline = true;

  const playPromise = heroTrailer.play();

  if(playPromise !== undefined){

    playPromise.catch(() => {

      /*
        Browser may block autoplay.
        The video remains ready and can
        start after user interaction.
      */

      document.addEventListener(
        "click",
        () => {
          heroTrailer.play().catch(() => {});
        },
        {once:true}
      );

    });

  }
}


/*
  Trailer progress events
*/

if(heroTrailer){

  heroTrailer.addEventListener(
    "timeupdate",
    checkTrailerProgress
  );

  heroTrailer.addEventListener(
    "loadedmetadata",
    checkTrailerProgress
  );

  heroTrailer.addEventListener(
    "canplay",
    startTrailer
  );

  /*
    Prevent accidental text restoration
    during video looping.
  */

  heroTrailer.addEventListener(
    "ended",
    () => {

      /*
        Video has loop=true.
        We intentionally don't reset
        trailerTextHidden.
      */

      if(trailerTextHidden && heroOverlay){
        heroOverlay.classList.add(
          "trailer-name-hidden"
        );
      }

    }
  );

  startTrailer();
}


/* =========================================================
   ECOMMERCE
   ========================================================= */

const PRODUCTS = {

  original:{
    name:"Original",
    price:189,
    image:"images/original.jpg.jpeg"
  },

  "sour-apple":{
    name:"Sour Apple",
    price:189,
    image:"images/sour-apple.jpg.jpeg"
  },

  citrus:{
    name:"Citrus",
    price:189,
    image:"images/citrus.jpg.jpeg"
  },

  "wild-berry":{
    name:"Wild Berry",
    price:189,
    image:"images/wild-berry.jpg.jpeg"
  }

};


let cart =
  JSON.parse(
    localStorage.getItem("firstFuelCart") || "{}"
  );


const money = n =>
  `₹${n.toLocaleString("en-IN")}`;


/* =========================================================
   CART
   ========================================================= */

function saveCart(){

  localStorage.setItem(
    "firstFuelCart",
    JSON.stringify(cart)
  );

  renderCart();
}


function addToCart(id){

  cart[id] = (cart[id] || 0) + 1;

  saveCart();

  showToast(
    `${PRODUCTS[id].name.toUpperCase()} ADDED TO BAG`
  );
}


function renderCart(){

  const wrap =
    document.getElementById("cartItems");

  const count =
    Object.values(cart)
      .reduce((a,b) => a + b,0);

  const countElement =
    document.getElementById("cartCount");

  if(countElement){
    countElement.textContent = count;
  }

  if(!wrap){
    return;
  }

  wrap.innerHTML = "";

  let subtotal = 0;


  Object.entries(cart).forEach(
    ([id,qty]) => {

      const p = PRODUCTS[id];

      if(!p){
        return;
      }

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

    }
  );


  if(!Object.keys(cart).length){

    wrap.innerHTML =
      `
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


  const subtotalElement =
    document.getElementById("cartSubtotal");

  const shippingElement =
    document.getElementById("cartShipping");

  const totalElement =
    document.getElementById("cartTotal");


  if(subtotalElement){
    subtotalElement.textContent =
      money(subtotal);
  }

  if(shippingElement){
    shippingElement.textContent =
      subtotal
        ? "CALCULATED AT CHECKOUT"
        : "—";
  }

  if(totalElement){
    totalElement.textContent =
      money(subtotal);
  }

}


/* =========================================================
   CLICK EVENTS
   ========================================================= */

document.addEventListener(
  "click",
  e => {

    /* ADD TO CART */

    const add =
      e.target.closest("[data-add]");

    if(add){

      addToCart(
        add.dataset.add
      );

      return;
    }


    /* QUANTITY */

    const quantity =
      e.target.closest("[data-qty]");

    if(quantity){

      const id =
        quantity.dataset.qty;

      cart[id] =
        (cart[id] || 0) +
        Number(quantity.dataset.change);


      if(cart[id] <= 0){
        delete cart[id];
      }


      saveCart();

      return;
    }


    /* REMOVE */

    const remove =
      e.target.closest("[data-remove]");

    if(remove){

      delete cart[
        remove.dataset.remove
      ];

      saveCart();

      return;
    }


    /* QUICK VIEW */

    const quick =
      e.target.closest(".quick-view");

    if(quick){

      openProduct(
        quick.dataset.product
      );

      return;
    }


    /* MODALS */

    const modalButton =
      e.target.closest("[data-modal]");

    if(modalButton){

      openModal(
        modalButton.dataset.modal
      );

      return;
    }

  }
);


/* =========================================================
   PRODUCT QUICK VIEW
   ========================================================= */

function openProduct(id){

  const p = PRODUCTS[id];

  if(!p){
    return;
  }


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
            closeModal();
          "
        >
          ADD TO BAG
          <span>↗</span>
        </button>

      </div>
    `

  );

}


/* =========================================================
   MODAL DATA
   ========================================================= */

const modalData = {

  "order-support":[
    "ORDER SUPPORT",

    `
      <p>
        Use the form below for order questions.
      </p>

      <div class="form-grid">

        <input
          placeholder="Order ID"
        >

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
            closeModal();
          "
        >
          SUBMIT REQUEST
          <span>↗</span>
        </button>

      </div>
    `
  ],


  shipping:[
    "SHIPPING & DELIVERY",

    `
      <p>
        FIRST FUEL ships within India.
        Estimated delivery is 4–7 days
        after dispatch.
      </p>

      <p>
        Shipping charges are calculated
        during checkout.
      </p>
    `
  ],


  cod:[
    "COD INFORMATION",

    `
      <p>
        Cash on Delivery is planned for
        eligible Indian delivery addresses.
      </p>

      <p>
        COD availability should be verified
        for the entered PIN code during
        production checkout.
      </p>
    `
  ],


  returns:[
    "RETURNS & REFUNDS",

    `
      <p>
        Returns and refunds should follow
        the final production policy shown
        at checkout.
      </p>

      <p>
        For damaged, incorrect or missing
        items, contact support promptly.
      </p>
    `
  ],


  faq:[
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


  contact:[
    "CONTACT US",

    `
      <p>
        Email:
        <a href="mailto:rajolds7@gmail.com">
          rajolds7@gmail.com
        </a>
      </p>

      <p>
        Instagram:
        @newhuuyrr_
      </p>

      <p>
        For order support, include your
        Order ID and checkout email.
      </p>
    `
  ],


  privacy:[
    "PRIVACY POLICY",

    `
      <p>
        This demo policy is a production
        placeholder.
      </p>

      <ul>

        <li>
          Customer data should be stored
          securely.
        </li>

        <li>
          Payment card details should be
          handled by the payment provider.
        </li>

        <li>
          Production systems should use
          HTTPS and server-side validation.
        </li>

        <li>
          Users should be informed about
          collected data and its purpose.
        </li>

      </ul>
    `
  ],


  terms:[
    "TERMS & CONDITIONS",

    `
      <p>
        Demo placeholder for the final
        legal terms.
      </p>

      <p>
        Production terms should cover
        orders, pricing, payment, delivery,
        cancellations and refunds.
      </p>
    `
  ],


  "shipping-policy":[
    "SHIPPING POLICY",

    `
      <p>
        India only.
      </p>

      <p>
        Estimated delivery:
        4–7 days.
      </p>

      <p>
        Shipping charges are calculated
        at checkout.
      </p>
    `
  ],


  "refund-policy":[
    "REFUND & CANCELLATION POLICY",

    `
      <p>
        Demo placeholder.
      </p>

      <p>
        The final policy should define
        cancellation windows, damaged
        delivery claims and refund timelines.
      </p>
    `
  ]

};


/* =========================================================
   MODAL FUNCTIONS
   ========================================================= */

function openModal(key){

  const data =
    modalData[key];

  if(data){
    openCustomModal(
      data[0],
      data[1]
    );
  }

}


function openCustomModal(
  title,
  body
){

  const eyebrow =
    document.getElementById(
      "modalEyebrow"
    );

  const titleElement =
    document.getElementById(
      "modalTitle"
    );

  const bodyElement =
    document.getElementById(
      "modalBody"
    );

  const backdrop =
    document.getElementById(
      "modalBackdrop"
    );


  if(eyebrow){
    eyebrow.textContent =
      "FIRST FUEL";
  }

  if(titleElement){
    titleElement.textContent =
      title;
  }

  if(bodyElement){
    bodyElement.innerHTML =
      body;
  }

  if(backdrop){
    backdrop.classList.add("open");
  }

  document.body.style.overflow =
    "hidden";
}


function closeModal(){

  const backdrop =
    document.getElementById(
      "modalBackdrop"
    );

  if(backdrop){
    backdrop.classList.remove("open");
  }

  document.body.style.overflow =
    "";
}


/* =========================================================
   MODAL BUTTONS
   ========================================================= */

const modalClose =
  document.getElementById(
    "modalClose"
  );

if(modalClose){
  modalClose.onclick =
    closeModal;
}


const modalBackdrop =
  document.getElementById(
    "modalBackdrop"
  );

if(modalBackdrop){

  modalBackdrop.addEventListener(
    "click",
    e => {

      if(
        e.target.id ===
        "modalBackdrop"
      ){
        closeModal();
      }

    }
  );

}


/* =========================================================
   CART OPEN / CLOSE
   ========================================================= */

const cartOpen =
  document.getElementById(
    "cartOpen"
  );

const cartDrawer =
  document.getElementById(
    "cartDrawer"
  );

const cartClose =
  document.getElementById(
    "cartClose"
  );


if(cartOpen && cartDrawer){

  cartOpen.onclick = () => {

    cartDrawer.classList.add(
      "open"
    );

  };

}


if(cartClose && cartDrawer){

  cartClose.onclick = () => {

    cartDrawer.classList.remove(
      "open"
    );

  };

}


/* =========================================================
   CHECKOUT
   ========================================================= */

const checkoutBtn =
  document.getElementById(
    "checkoutBtn"
  );


if(checkoutBtn){

  checkoutBtn.onclick = () => {

    if(!Object.keys(cart).length){

      showToast(
        "YOUR BAG IS EMPTY"
      );

      return;
    }


    openCustomModal(

      "CHECKOUT READY",

      `
        <p>
          Your cart is ready for the
          production checkout.
        </p>

        <p>
          This current site is a
          front-end demo. Connect your
          backend, order database and
          payment provider before taking
          live payments.
        </p>

        <button
          class="primary-btn full"
          onclick="closeModal()"
        >
          CLOSE
          <span>×</span>
        </button>
      `

    );

  };

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(msg){

  const toast =
    document.getElementById(
      "toast"
    );

  if(!toast){
    return;
  }

  toast.textContent =
    msg;

  toast.classList.add(
    "show"
  );


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      1800
    );

}


/* =========================================================
   INITIAL CART RENDER
   ========================================================= */

renderCart();
