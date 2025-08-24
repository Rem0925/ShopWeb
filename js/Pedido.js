const Previa = {
  name: document.getElementById("NombrePe"),
  correo: document.getElementById("CorreoPe"),
  total: document.getElementById("total"),
  Carrito: document.getElementById("Cart"),
  tlf: document.getElementById("TlfPE"),
  id: document.getElementById("IdPe"),
};

var Cart = JSON.parse(localStorage.getItem("carrt")) || [];
var Tot = 0;
const enviar = document.getElementById("Enviar-Pedido");
const PedidoIm = document.getElementById("Content");
const DatosPe = document.getElementById("Datos-Pedido");

const form = document.getElementById("pedidoForm");
let formData = {};

const idCompra = "ID" + Math.random().toString(36).substr(2, 9);

form.addEventListener("input", (event) => {
  const target = event.target;
  if (target.name) {
    formData[target.name] = target.value;
  }
  Previa.name.innerHTML = `<strong>Nombre del usuario:</strong> ${formData.from_name}`;
  Previa.correo.innerHTML = ` <strong>Correo:</strong> ${formData.email}`;
  Previa.tlf.innerHTML = `<strong>Telefono:</strong> ${formData.telefono}`;
});

Previa.id.innerHTML = `<strong>Id de Compra:</strong> ${idCompra}`;

function displayCart() {
  Previa.Carrito.innerHTML = "";
  Tot = 0;
  Cart.forEach((e) => {
    const CarElemet = document.createElement("div");
    CarElemet.classList.add("product");
    CarElemet.innerHTML = `
      <img src="${e.imagen}" class="product-Imagen"  alt="prodcutoIMG${e.id}">
      <div class="product-details">
                      
                      <p class="product-name">${e.name}</p>
                      <p class="product-quantity">Cantidad:${e.cantidad}</p>
                      <p class="product-price">Precio unitario: ${e.price} $</p>
                      <p class="product-total">Total: ${
                        e.price * e.cantidad
                      } $</p>
        </div>
      `;
    Tot += e.price * e.cantidad;
    Previa.total.innerHTML = `<strong>Total:</strong> ${Tot} $`;
    Previa.Carrito.appendChild(CarElemet);
  });
}
function mostrarTicket(){
  PedidoIm.style.display = "block";
  DatosPe.style.display = "none";
  Cart = JSON.parse(localStorage.getItem("carrt"));
  displayCart();
}
displayCart();

form.addEventListener("submit", function (event) {
  event.preventDefault();
  Cart = JSON.parse(localStorage.getItem("carrt"));
 enviar.innerText = "Enviando...";
  const serviceID = "default_service";
  const templateID = "template_3w7dsln";
  // Captura los datos del formulario y crea un objeto con los detalles del pedido
  const pedido = {
    from_name: formData.from_name,
    email: formData.email,
    tlf:formData.telefono,
    id: idCompra,
    total: Tot,
    carrito: Cart.map((item) => ({
      nombre: item.name,
      precio: item.price,
      cantidad: item.cantidad,
      precio_total: item.price * item.cantidad,
    })),
  }; // Envía los datos del pedido utilizando EmailJS
  emailjs.send(serviceID, templateID, pedido).then(
    () => {
      enviar.innerText = "Enviado";
      alert("Pedido Enviado!");
      mostrarTicket();
      window.parent.postMessage('activarBotonGuardar', '*');
    },
  );
});

