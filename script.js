const TOTAL_FRAMES=285;
const section=document.getElementById("animationSection");
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
const loader=document.getElementById("loader");
const loaderProgress=document.getElementById("loaderProgress");
const loaderPct=document.getElementById("loaderPct");
const heroOverlay=document.getElementById("heroOverlay");
const scrollIndicator=document.getElementById("scrollIndicator");

ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
const images=new Array(TOTAL_FRAMES);
let currentFrame=0,maxFrameReached=0,loadedFrames=0,textFaded=false;

const framePaths=Array.from({length:TOTAL_FRAMES},(_,i)=>`frames/ezgif-frame-${String(i+1).padStart(3,"0")}.jpg`);

function resizeCanvas(){
  const dpr=Math.min(window.devicePixelRatio||1,3),w=innerWidth,h=innerHeight;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";drawFrame(currentFrame);
}
function drawFrame(index){
  const image=images[index];if(!image||!image.complete||!image.naturalWidth)return;
  const sw=innerWidth,sh=innerHeight,iw=image.naturalWidth,ih=image.naturalHeight;
  const scale=Math.max(sw/iw,sh/ih),dw=iw*scale,dh=ih*scale,x=(sw-dw)/2,y=(sh-dh)/2;
  ctx.fillStyle="#000";ctx.fillRect(0,0,sw,sh);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.drawImage(image,x,y,dw,dh);
}
function updateAnimation(){
  const rect=section.getBoundingClientRect(),scrollDistance=section.offsetHeight-innerHeight;
  if(scrollDistance<=0)return;
  let progress=-rect.top/scrollDistance;progress=Math.max(0,Math.min(1,progress));
  const targetFrame=Math.floor(progress*(TOTAL_FRAMES-1));
  if(targetFrame>maxFrameReached){maxFrameReached=targetFrame;currentFrame=targetFrame;drawFrame(currentFrame);}
  const fadeStart=.30,fadeEnd=.42;
  if(!textFaded&&progress>=fadeStart){
    let opacity=1-((progress-fadeStart)/(fadeEnd-fadeStart));opacity=Math.max(0,Math.min(1,opacity));
    heroOverlay.style.opacity=opacity;
    heroOverlay.style.transform=`translate(-50%,calc(-50% + ${(1-opacity)*25}px))`;
    if(progress>=fadeEnd){textFaded=true;heroOverlay.style.opacity="0";heroOverlay.style.transform="translate(-50%,calc(-50% + 25px))";}
  }
  if(progress>.10)scrollIndicator.style.opacity=Math.max(0,1-((progress-.10)/.15));else scrollIndicator.style.opacity="1";
}
function preloadFrames(){
  return new Promise(resolve=>{
    framePaths.forEach((path,index)=>{
      const image=new Image();image.decoding="async";image.src=path;
      image.onload=()=>{images[index]=image;loadedFrames++;const pct=Math.round(loadedFrames/TOTAL_FRAMES*100);loaderProgress.style.width=`${pct}%`;loaderPct.textContent=`${pct}%`;if(index===0){currentFrame=0;maxFrameReached=0;drawFrame(0)};if(loadedFrames===TOTAL_FRAMES)resolve();};
      image.onerror=()=>{console.error("Failed to load:",path);loadedFrames++;const pct=Math.round(loadedFrames/TOTAL_FRAMES*100);loaderProgress.style.width=`${pct}%`;loaderPct.textContent=`${pct}%`;if(loadedFrames===TOTAL_FRAMES)resolve();};
    });
  });
}

/* Ecommerce */
const PRODUCTS={
  original:{name:"Original",price:189,image:"images/original.jpg.jpeg"},
  "sour-apple":{name:"Sour Apple",price:189,image:"images/sour-apple.jpg.jpeg"},
  citrus:{name:"Citrus",price:189,image:"images/citrus.jpg.jpeg"},
  "wild-berry":{name:"Wild Berry",price:189,image:"images/wild-berry.jpg.jpeg"}
};
let cart=JSON.parse(localStorage.getItem("firstFuelCart")||"{}");
const money=n=>`₹${n.toLocaleString("en-IN")}`;
function saveCart(){localStorage.setItem("firstFuelCart",JSON.stringify(cart));renderCart();}
function addToCart(id){cart[id]=(cart[id]||0)+1;saveCart();showToast(`${PRODUCTS[id].name.toUpperCase()} ADDED TO BAG`);}
function renderCart(){
  const wrap=document.getElementById("cartItems"),count=Object.values(cart).reduce((a,b)=>a+b,0);
  document.getElementById("cartCount").textContent=count;
  wrap.innerHTML="";
  let subtotal=0;
  Object.entries(cart).forEach(([id,qty])=>{
    const p=PRODUCTS[id];subtotal+=p.price*qty;
    wrap.insertAdjacentHTML("beforeend",`<div class="cart-item"><img src="${p.image}" alt="${p.name}"><div><h4>${p.name}</h4><p>${money(p.price)} · 250 ML</p><div class="qty"><button data-qty="${id}" data-change="-1">−</button><span>${qty}</span><button data-qty="${id}" data-change="1">+</button></div></div><button class="remove" data-remove="${id}">REMOVE</button></div>`);
  });
  if(!Object.keys(cart).length)wrap.innerHTML='<div style="color:#666;padding:30px 0;font-size:13px">Your bag is empty. Choose your fuel from the shop.</div>';
  document.getElementById("cartSubtotal").textContent=money(subtotal);
  document.getElementById("cartShipping").textContent=subtotal?"CALCULATED AT CHECKOUT":"—";
  document.getElementById("cartTotal").textContent=money(subtotal);
}
document.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return;}
  const q=e.target.closest("[data-qty]");if(q){const id=q.dataset.qty;cart[id]=(cart[id]||0)+Number(q.dataset.change);if(cart[id]<=0)delete cart[id];saveCart();return;}
  const rem=e.target.closest("[data-remove]");if(rem){delete cart[rem.dataset.remove];saveCart();return;}
  const quick=e.target.closest(".quick-view");if(quick){openProduct(quick.dataset.product);return;}
  const modalBtn=e.target.closest("[data-modal]");if(modalBtn){openModal(modalBtn.dataset.modal);return;}
});
function openProduct(id){
  const p=PRODUCTS[id];
  openCustomModal(p.name,`<img src="${p.image}" alt="${p.name}" style="width:100%;aspect-ratio:1/1;object-fit:cover;background:#111"><div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px"><div><p style="margin:0;color:#888">250 ML</p><strong style="font-size:20px">${money(p.price)}</strong></div><button class="primary-btn" onclick="addToCart('${id}');closeModal()">ADD TO BAG <span>↗</span></button></div>`);
}
const modalData={
  "order-support":["ORDER SUPPORT",`<p>Use the form below for order questions. In production, connect this form to your support backend.</p><div class="form-grid"><input placeholder="Order ID"><input type="email" placeholder="Email address"><textarea placeholder="Describe the issue"></textarea><button class="primary-btn" onclick="showToast('SUPPORT REQUEST READY');closeModal()">SUBMIT REQUEST <span>↗</span></button></div>`],
  shipping:["SHIPPING & DELIVERY",`<p>FIRST FUEL ships within India. Estimated delivery is 4–7 days after dispatch. Delivery timing can vary by location and courier.</p><p>Shipping is not free by default and the final charge should be calculated by the production checkout.</p>`],
  cod:["COD INFORMATION",`<p>Cash on Delivery is planned for eligible Indian delivery addresses. The live checkout should verify COD availability for the entered PIN code before confirming an order.</p>`],
  returns:["RETURNS & REFUNDS",`<p>Returns and refunds should be governed by the final production policy shown at checkout. For damaged, incorrect or missing items, contact support promptly with your order ID and relevant photos.</p>`],
  faq:["FAQ",`<p><strong>Price:</strong> ₹189 / 250 ML can.</p><p><strong>Delivery:</strong> India only, estimated 4–7 days.</p><p><strong>Support:</strong> rajolds7@gmail.com or Instagram @newhuuyrr_.</p>`],
  contact:["CONTACT US",`<p>Email: <a href="mailto:rajolds7@gmail.com">rajolds7@gmail.com</a></p><p>Instagram: @newhuuyrr_</p><p>For order support, include your Order ID and checkout email.</p>`],
  privacy:["PRIVACY POLICY",`<p>This demo policy is a production placeholder. A live site should collect only the information needed to process orders, delivery, payments and support.</p><ul><li>Customer data should be stored securely and accessed only when necessary.</li><li>Payment card details should be handled by the payment provider rather than stored by the storefront.</li><li>Production systems should use HTTPS, server-side validation, secure authentication and appropriate access controls.</li><li>Users should be told what data is collected, why it is used, how long it is retained and how to contact the business.</li></ul>`],
  terms:["TERMS & CONDITIONS",`<p>Demo placeholder for the final legal terms. Before launch, replace this with reviewed terms covering orders, pricing, payment, delivery, cancellations, returns, acceptable use and limitation of liability.</p>`],
  "shipping-policy":["SHIPPING POLICY",`<p>India only. Estimated delivery: 4–7 days. Shipping charges are calculated at checkout. Exact timelines depend on destination and courier conditions.</p>`],
  "refund-policy":["REFUND & CANCELLATION POLICY",`<p>Demo placeholder. The final policy should clearly define cancellation windows, damaged/incorrect delivery claims, refund timelines and the payment method used for refunds.</p>`],
  cookies:["COOKIE POLICY",`<p>Demo placeholder. A production site should list necessary cookies, analytics/marketing cookies if used, their purpose, retention and available controls.</p>`]
};
function openModal(key){const data=modalData[key];if(data)openCustomModal(data[0],data[1]);}
function openCustomModal(title,body){document.getElementById("modalEyebrow").textContent="FIRST FUEL";document.getElementById("modalTitle").textContent=title;document.getElementById("modalBody").innerHTML=body;document.getElementById("modalBackdrop").classList.add("open");document.body.style.overflow="hidden";}
function closeModal(){document.getElementById("modalBackdrop").classList.remove("open");document.body.style.overflow="";}
document.getElementById("modalClose").onclick=closeModal;document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
document.getElementById("cartOpen").onclick=()=>document.getElementById("cartDrawer").classList.add("open");
document.getElementById("cartClose").onclick=()=>document.getElementById("cartDrawer").classList.remove("open");
document.getElementById("checkoutBtn").onclick=()=>{if(!Object.keys(cart).length){showToast("YOUR BAG IS EMPTY");return;}openCustomModal("CHECKOUT READY",`<p>Your cart is ready for the production checkout.</p><p>This current site is a front-end demo: connect your backend, order database and a payment provider before taking live payments.</p><button class="primary-btn full" onclick="closeModal()">CLOSE <span>×</span></button>`);};
function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),1800);}
window.addEventListener("scroll",updateAnimation,{passive:true});window.addEventListener("resize",resizeCanvas);
async function start(){resizeCanvas();await preloadFrames();resizeCanvas();currentFrame=0;maxFrameReached=0;drawFrame(0);renderCart();setTimeout(()=>loader.classList.add("hide"),300);}
start();
