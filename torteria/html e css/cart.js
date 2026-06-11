(function () {
  const STORAGE_KEY = "torteria_cart_demo";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateBadge();
    renderCart();
  }

  function updateBadge() {
    const cart = getCart();
    const n = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = n;
      el.setAttribute("data-empty", n === 0 ? "true" : "false");
    });
  }

  function formatMoney(v) {
    return v.toFixed(2).replace(".", ",");
  }

  function buildWhatsAppMessage(cart) {
    const lines = [
      "Olá, gostaria de confirmar o pedido da Torteria do Massa:",
      ""
    ];

    cart.forEach((item) => {
      lines.push(`- ${item.qty}x ${item.name} (R$ ${formatMoney(item.price)})`);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    lines.push("", `Total: R$ ${formatMoney(total)}`);
    lines.push("Por favor confirme o pedido. Obrigado!");
    return lines.join("\n");
  }

  function renderCart() {
    const list = document.querySelector("[data-cart-list]");
    const empty = document.querySelector("[data-cart-empty]");
    const totalEl = document.querySelector("[data-cart-total]");
    const whatsappBtn = document.querySelector("[data-whatsapp-order]");
    if (!list) return;

    const cart = getCart();
    list.innerHTML = "";

    if (cart.length === 0) {
      if (empty) empty.hidden = false;
      if (totalEl) totalEl.textContent = "0,00";
      if (whatsappBtn) {
        whatsappBtn.hidden = true;
        whatsappBtn.href = "#";
      }
      return;
    }
    if (empty) empty.hidden = true;

    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price * item.qty;
      const row = document.createElement("div");
      row.className = "cart-line";
      row.innerHTML =
        '<img src="' +
        item.img +
        '" alt="" class="cart-line__img" loading="lazy" />' +
        '<div class="cart-line__body">' +
        '<span class="cart-line__name">' +
        item.name +
        "</span>" +
        '<span class="cart-line__meta">R$ ' +
        formatMoney(item.price) +
        " × " +
        item.qty +
        "</span>" +
        "</div>" +
        '<button type="button" class="cart-line__remove" data-remove-idx="' +
        idx +
        '" aria-label="Remover item">×</button>';
      list.appendChild(row);
    });

    if (totalEl) totalEl.textContent = formatMoney(total);
    if (whatsappBtn) {
      whatsappBtn.hidden = false;
      const message = buildWhatsAppMessage(cart);
      whatsappBtn.href =
        "https://api.whatsapp.com/send?phone=5541984663572&text=" +
        encodeURIComponent(message);
    }
  }

  function addItem(payload) {
    const cart = getCart();
    const i = cart.findIndex((x) => x.id === payload.id);
    if (i >= 0) cart[i].qty += 1;
    else cart.push({ ...payload, qty: 1 });
    setCart(cart);
  }

  function removeAt(idx) {
    const cart = getCart();
    cart.splice(idx, 1);
    setCart(cart);
  }

  function openCart() {
    const panel = document.querySelector("[data-cart-panel]");
    const backdrop = document.querySelector("[data-cart-backdrop]");
    if (panel) {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
    }
    if (backdrop) backdrop.classList.add("is-visible");
    document.body.classList.add("cart-open");
  }

  function closeCart() {
    const panel = document.querySelector("[data-cart-panel]");
    const backdrop = document.querySelector("[data-cart-backdrop]");
    if (panel) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }
    if (backdrop) backdrop.classList.remove("is-visible");
    document.body.classList.remove("cart-open");
  }

  document.addEventListener("click", function (e) {
    const addBtn = e.target.closest("[data-add-cart]");
    if (addBtn) {
      e.preventDefault();
      const id = addBtn.getAttribute("data-add-cart");
      const card = addBtn.closest(".product-card");
      const name = card
        ? card.querySelector(".product-info h3")?.textContent?.trim()
        : addBtn.getAttribute("data-name");
      const price = parseFloat(
        card?.querySelector("[data-price]")?.getAttribute("data-price") ||
          addBtn.getAttribute("data-price") ||
          "0"
      );
      const img =
        card?.querySelector(".product-img")?.getAttribute("src") ||
        addBtn.getAttribute("data-img") ||
        "";
      if (id && name) {
        addItem({ id, name, price, img });
        openCart();
        addBtn.classList.add("is-added");
        setTimeout(() => addBtn.classList.remove("is-added"), 600);
      }
      return;
    }

    if (e.target.closest("[data-open-cart]")) {
      e.preventDefault();
      openCart();
      return;
    }
    if (e.target.closest("[data-close-cart]")) {
      e.preventDefault();
      closeCart();
      return;
    }
    const rm = e.target.closest("[data-remove-idx]");
    if (rm) {
      removeAt(parseInt(rm.getAttribute("data-remove-idx"), 10));
      return;
    }
    if (e.target.matches("[data-cart-backdrop].is-visible")) {
      closeCart();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCart();
  });

  updateBadge();
  renderCart();
})();
