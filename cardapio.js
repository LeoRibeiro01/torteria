/* Monta a página de produtos a partir de cardapio-data.js */
(function () {
  const data = window.CARDAPIO || [];
  const root = document.querySelector("[data-cardapio]");
  const chips = document.querySelector("[data-cardapio-chips]");
  const search = document.querySelector("[data-cardapio-search]");
  const emptyMsg = document.querySelector("[data-cardapio-empty]");
  if (!root) return;

  const FALLBACK_IMG = "img/logo.png";
  let activeCat = "todos";

  function slug(s) {
    return s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function money(v) {
    return v.toFixed(2).replace(".", ",");
  }

  function card(item) {
    const img = item.img || FALLBACK_IMG;
    const noPhoto = item.img ? "" : " product-img--placeholder";
    return (
      '<article class="product-card" data-search="' + esc(slug(item.nome + " " + (item.desc || ""))) + '">' +
      '<img src="' + esc(img) + '" alt="' + esc(item.nome) + '" class="product-img' + noPhoto + '" loading="lazy" ' +
      "onerror=\"this.onerror=null;this.src='" + FALLBACK_IMG + "';this.classList.add('product-img--placeholder')\" />" +
      '<div class="product-info">' +
      "<h3>" + esc(item.nome) + "</h3>" +
      (item.desc ? "<p>" + esc(item.desc) + "</p>" : "") +
      (item.medida ? '<p class="product-measure">' + esc(item.medida) + "</p>" : "") +
      '<p class="product-price" data-price="' + item.preco + '">R$ ' + money(item.preco) + "</p>" +
      '<button type="button" class="add-to-cart-btn" data-add-cart="p' + esc(item.id) + '"><i class="fas fa-plus"></i> Adicionar ao carrinho</button>' +
      "</div></article>"
    );
  }

  // Seções por categoria
  root.innerHTML = data
    .map(
      (cat) =>
        '<section class="menu-category" id="cat-' + slug(cat.nome) + '" data-cat="' + slug(cat.nome) + '">' +
        '<h3 class="menu-category__title">' + esc(cat.nome) + ' <span class="menu-category__count">' + cat.itens.length + "</span></h3>" +
        '<div class="product-cards">' + cat.itens.map(card).join("") + "</div></section>"
    )
    .join("");

  // Botões de categoria
  if (chips) {
    const total = data.reduce((n, c) => n + c.itens.length, 0);
    chips.innerHTML =
      '<button type="button" class="menu-chip is-active" data-chip="todos">Todos <span>' + total + "</span></button>" +
      data.map((c) => '<button type="button" class="menu-chip" data-chip="' + slug(c.nome) + '">' + esc(c.nome) + " <span>" + c.itens.length + "</span></button>").join("");
    chips.addEventListener("click", (e) => {
      const b = e.target.closest("[data-chip]");
      if (!b) return;
      activeCat = b.getAttribute("data-chip");
      chips.querySelectorAll(".menu-chip").forEach((x) => x.classList.toggle("is-active", x === b));
      apply();
    });
  }

  if (search) search.addEventListener("input", apply);

  function apply() {
    const q = search ? slug(search.value) : "";
    let shown = 0;
    root.querySelectorAll(".menu-category").forEach((sec) => {
      const catOk = activeCat === "todos" || sec.getAttribute("data-cat") === activeCat;
      let visible = 0;
      sec.querySelectorAll(".product-card").forEach((c) => {
        const ok = catOk && (!q || c.getAttribute("data-search").includes(q));
        c.hidden = !ok;
        if (ok) visible++;
      });
      sec.hidden = visible === 0;
      shown += visible;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }
})();
