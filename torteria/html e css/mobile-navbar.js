/**
 * Menu mobile com overlay, bloqueio de scroll e fechamento ao navegar.
 */
class MobileNavbar {
  constructor(mobileMenu, navList, navLinks) {
    this.mobileMenu = document.querySelector(mobileMenu);
    this.navList = document.querySelector(navList);
    this.navLinks = document.querySelectorAll(navLinks);
    this.backdrop = document.getElementById("navBackdrop");
    this.activeClass = "active";
    this.handleClick = this.handleClick.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
  }

  isMobileLayout() {
    return window.matchMedia("(max-width: 999px)").matches;
  }

  setOpen(open) {
    if (!this.mobileMenu || !this.navList) return;
    this.mobileMenu.classList.toggle(this.activeClass, open);
    this.navList.classList.toggle(this.activeClass, open);
    document.body.classList.toggle("nav-open", open);
    if (this.backdrop) {
      this.backdrop.classList.toggle("is-visible", open);
      this.backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
  }

  close() {
    this.setOpen(false);
  }

  animateLinks() {
    this.navLinks.forEach((link, index) => {
      if (this.navList.classList.contains(this.activeClass)) {
        link.style.animation = "";
        void link.offsetWidth;
        link.style.animation =
          "navLinkFade 0.45s ease forwards " + (index / 8 + 0.15) + "s";
      } else {
        link.style.animation = "";
      }
    });
  }

  handleClick() {
    const next = !this.navList.classList.contains(this.activeClass);
    this.setOpen(next);
    this.animateLinks();
  }

  handleBackdropClick() {
    if (this.navList && this.navList.classList.contains(this.activeClass)) {
      this.close();
    }
  }

  handleLinkClick() {
    if (this.isMobileLayout()) this.close();
  }

  handleResize() {
    if (!this.isMobileLayout()) this.close();
  }

  addClickEvent() {
    if (this.mobileMenu) {
      this.mobileMenu.addEventListener("click", this.handleClick);
    }
    if (this.backdrop) {
      this.backdrop.addEventListener("click", this.handleBackdropClick);
    }
    this.navLinks.forEach(function (link) {
      link.addEventListener("click", this.handleLinkClick);
    }, this);
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && this.navList && this.navList.classList.contains(this.activeClass)) {
        this.close();
      }
    }.bind(this));
  }

  init() {
    if (this.mobileMenu) this.addClickEvent();
    return this;
  }
}

new MobileNavbar(".mobile-menu", ".nav-list", ".nav-list a").init();
