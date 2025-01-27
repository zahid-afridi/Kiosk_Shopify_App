
window.addEventListener("DOMContentLoaded", async() => {
  console.log("Extension loaded 151");
  const UrlParams = new URLSearchParams(window.location.search);
  const RefreanceId = UrlParams.get("referenceKey");
  console.log("referenc", RefreanceId);

  let seconds;
  let screensaverSeconds;
  let videoUrl;
  let URL;
  let ButtonText;
  let ButtonColor;
  let ScreenShow=true

  // console.log(Shopify.shop);

  const fetchScreensaverConfig = async () => {
    try {
      const response = await fetch(
        `https://${Shopify.shop}/apps/proxy/settingapi?storeName=${Shopify.shop}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const data = await response.json();
      console.log("data", data);
      ButtonText=data.buttonText
      ButtonColor=data.buttonColor
      console.log('bgcolor',ButtonColor)
      console.log('bgText',ButtonText)
      return {
        videoUrl: data.videoUrl,
        seconds: data.seconds,
        screensaverSeconds: data.screensaverSeconds,
        URL: data.redirectUrl,
        
      };
    } catch (error) {
      console.error("Error fetching screensaver config:", error);
    }
  };
 
  const screeensaverFunction = () => {
    console.log(
      "seconds",
      seconds,
      "Screen",
      screensaverSeconds,
      "video",
      videoUrl,
      "redirect",
      URL
    );

    let body = document.getElementsByTagName("body")[0];

    let screensaverActive = false;
    let timer;

    const screensaverElement = document.createElement("div");
    screensaverElement.classList.add("screensaver");
    body.appendChild(screensaverElement);

    const videoElement = document.createElement("video");
    videoElement.src = videoUrl;
    videoElement.loop = true;
    videoElement.muted = true;
    screensaverElement.appendChild(videoElement);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.style.display = "none";
    screensaverElement.appendChild(buttonContainer);

    const googleButton = document.createElement("button");
    googleButton.innerHTML = "Go to Link";
    googleButton.addEventListener("click", () => {
      window.location.href = URL;
    });

    const activateScreensaver = () => {
      if (screensaverActive) return;
      screensaverActive = true;
      screensaverElement.style.display = "block";
      videoElement.play();
      buttonContainer.style.display = "block";

      setTimeout(() => {
        buttonContainer.style.display = "block";
      }, 2000);
    };

    const deactivateScreensaver = async() => {
      const Cartapi = await fetch("/cart/clear.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("CartClear", Cartapi);
      screensaverActive = false;
      screensaverElement.style.display = "none";
      videoElement.pause();
      buttonContainer.style.display = "none";
      resetTimer();
      window.location.reload()
    };

    const hideButton = document.createElement("button");
    hideButton.innerHTML = "Hide Screensaver";
    hideButton.addEventListener("click", deactivateScreensaver);

    buttonContainer.appendChild(googleButton);
    buttonContainer.appendChild(hideButton);

    const resetTimer = () => {
      clearTimeout(timer);
      if (!screensaverActive && ScreenShow) {
        timer = setTimeout(activateScreensaver, screensaverSeconds * 1000);
      }
    };

    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("scroll", resetTimer);
  };

  const config = await fetchScreensaverConfig();

    if (config) {
        seconds = config.seconds;
        screensaverSeconds = config.screensaverSeconds;
        videoUrl = config.videoUrl;
        URL = config.URL;

        if (videoUrl) {
            screeensaverFunction();
        } else {
            console.log("Video URL is not available. Screensaver functionality will not run.");
        }
    }

  if (RefreanceId) {
    localStorage.setItem("referenceKey", RefreanceId);
  }

  const storedReferenceKey = localStorage.getItem("referenceKey");
  if (storedReferenceKey) {
    const modal = document.getElementById("kioskModal");
    const closeModalButton = document.getElementById("closeModal");
    let currency;
    let TotalPrice;

    const showModal = async (event) => {
      event.preventDefault();
      ScreenShow=false
      const Cartapi = await fetch("/cart.js", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const CartData = await Cartapi.json();
      console.log("CartData", CartData);

      const cartToken = CartData.token.split("?")[0];
      TotalPrice = CartData.original_total_price / 100;
      currency = CartData.currency;

      console.log("Token", cartToken);
      console.log("TotalPrice", TotalPrice);
      console.log("Currency", currency);

      const SiteUrl = window.location.href;
      const baseUrl = SiteUrl.split(".com")[0] + ".com";
      const sanitizedCartToken = cartToken.replace(/"/g, "");
      const returnUrl = `${baseUrl}/checkouts/cn/${sanitizedCartToken}`;
      console.log("return", returnUrl);

      modal.classList.add("modal");
      modal.classList.remove("hidemodal");

      setTimeout(async () => {
        hideModal();
        console.log("hiting clear api");
        const Cartapi = await fetch("/cart/clear.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("CartClear", Cartapi);
        console.log("modal close successfullyywee");
        window.location.href = `/?referenceKey=${storedReferenceKey}`;
      }, seconds * 1000);

      loadQRCodeLibrary(() => {
        displayQRCode(returnUrl);
      });
    };

    const hideModal = () => {
      ScreenShow=true
      modal.classList.remove("modal");
      modal.classList.add("hidemodal");
    };

    const loadQRCodeLibrary = (callback) => {
      if (!window.QRCode) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
        script.onload = callback;
        document.head.appendChild(script);
      } else {
        callback();
      }
    };

    const displayQRCode = async (url) => {
      const response = await fetch(
        `https://${Shopify.shop}/apps/proxy/analytics?domain=${Shopify.shop}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("AnlaticdataSave");
      const modalContent = document.querySelector(".modal-content");
      modalContent.innerHTML = "";

      const closeButton = document.createElement("button");
      closeButton.classList.add("close-button");
      closeButton.id = "closeModal";
      closeButton.innerHTML = "&times;";
      closeButton.addEventListener("click", hideModal);
      modalContent.appendChild(closeButton);

      const title = document.createElement("h1");
      title.textContent = "PAY SECURELY";
      title.classList.add("payTitle");
      modalContent.appendChild(title);

      const totalPrice = document.createElement("h4");
      totalPrice.textContent = `Total: ${TotalPrice} ${currency}`;
      totalPrice.classList.add("totalPrice");
      modalContent.appendChild(totalPrice);

      const qrDiv = document.createElement("div");
      qrDiv.id = "qrcode";
      modalContent.appendChild(qrDiv);

      new QRCode(qrDiv, {
        text: url,
        width: 250,
        height: 250,
      });

      const scanMessage = document.createElement("h4");
      scanMessage.textContent = "Scan to pay by phone";
      scanMessage.classList.add("scanMessage");
      modalContent.appendChild(scanMessage);
    };
    console.log('bgcolor',ButtonColor)
    console.log('btText',ButtonText)
    const attachClickListener = (button) => {
      if (button) {
        button.addEventListener("click", showModal);
        button.style.backgroundColor=ButtonColor,
        button.innerHTML=ButtonText
      }
    };

    const checkoutButton = document.getElementById("CartDrawer-Checkout ");
    const buyNowButton = document.querySelector(
      'button.shopify-payment-button__button.shopify-payment-button__button--unbranded'
    );
    if (buyNowButton) {
      buyNowButton.style.display = "none";
      console.log("'Buy it now' button is now hidden.");
    } else {
      console.log("'Buy it now' button not found.");
    }
    const checkoutButtonForm = document.querySelector(
      '.cart-notification__links .button--primary[name="checkout"]'
    );
    if (checkoutButtonForm) {
      if (checkoutButtonForm) {
        checkoutButtonForm.style.backgroundColor = ButtonColor;
        checkoutButtonForm.innerHTML=ButtonText
      }
    
    }
    
    checkoutButtonForm.addEventListener("submit", showModal);
    attachClickListener(checkoutButton || checkoutButtonForm);

    const checkoutButtons = document.querySelectorAll(".cart__checkout-button");
    checkoutButtons.forEach(attachClickListener);

    closeModalButton.addEventListener("click", hideModal);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        const updatedButtonfrom = document.querySelector(
          '.cart-notification__links .button--primary[name="checkout"]'
        );
        const updatedButton = document.getElementById("CartDrawer-Checkout");
        if (updatedButton || updatedButtonfrom) {
          attachClickListener(updatedButton);
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    console.log("No referenceKey in local storage, skipping modal logic.");
  }
});
