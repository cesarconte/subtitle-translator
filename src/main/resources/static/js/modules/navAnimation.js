/**
 * Módulo para añadir efectos y animaciones a la navegación
 *
 * Este módulo agrega efectos visuales modernos a la barra de navegación,
 * como el efecto ripple al hacer click en los elementos del menú.
 */

// Crear el efecto ripple en los enlaces de la barra de navegación
function createRippleEffect() {
  const navLinks = document.querySelectorAll(".navbar__link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Crear el efecto ripple solo si no existe ya uno en animación
      if (!this.querySelector(".ripple")) {
        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        this.appendChild(ripple);

        // Posicionar el efecto donde se hizo click
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

        // Eliminar el elemento después de terminar la animación
        ripple.addEventListener("animationend", function () {
          this.remove();
        });
      }
    });
  });
}

// Inicializar cuando se carga el DOM
document.addEventListener("DOMContentLoaded", () => {
  createRippleEffect();
});

// Exportar las funciones para poder usarlas en otros módulos si es necesario
export default {
  createRippleEffect,
};
