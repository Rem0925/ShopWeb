//Botones de las secciones
const Botones = {
  Productos: document.getElementById("products_BTN"),
  Carrito: document.getElementById("cart_BTN"),
  Admin: document.getElementById("admin_BTN"),
};
//Referencia a cada una de las secciones de la pagina
const Sections = {
  Productos: document.getElementById("products"),
  Carrito: document.getElementById("cart"),
  Admin: document.getElementById("admin"),
};
const form = document.getElementById("Login");
const adminPanel = document.getElementById("Ad_Pan");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("Error");
const cerrarSesionButton = document.getElementById("cerrarSesion");
const ListaProductosAD = document.getElementById("listProduct");
const Previa = {
  name: document.getElementById("NombreProAd"),
  price: document.getElementById("PriceProAd"),
  img: document.getElementById("ImgProAd"),
};
const addProductButton = document.getElementById("Agregar");
const deleteProductButton = document.getElementById("BorrarProducto");

var Productos = JSON.parse(localStorage.getItem("productos")) ?? [
  {
    id: 1,
    name: "Producto 1",
    price: 10,
    imagen: "/1/Proyectos/Shop/img/NoImg.jpg",
  },
  {
    id: 2,
    name: "Producto 2",
    price: 15,
    imagen: "/1/Proyectos/Shop/img/NoImg.jpg",
  },
  {
    id: 3,
    name: "Producto 3",
    price: 150,
    imagen: "/1/Proyectos/Shop/img/NoImg.jpg",
  },
  {
    id: 4,
    name: "Producto 4",
    price: 100,
    imagen: "/1/Proyectos/Shop/img/NoImg.jpg",
  },
];
var Carrito = JSON.parse(localStorage.getItem("carrt")) || [];

function displayProducts(filter = "") {
  const productsSection = document.getElementById("Products_all");
  productsSection.innerHTML = " ";
  Productos.forEach((product) => {
    if (product.name.toLowerCase().includes(filter.toLowerCase())) {
      const productElement = document.createElement("div");
      productElement.classList.add("product");

      productElement.innerHTML = `
            <h3>${product.name} </h3>
            <p>${product.price} $</p>
            <img src="${product.imagen}" alt="producto ${product.id}">
            <button onclick="AgregarCarro(${product.id},'${product.name}',${product.price},
            '${product.imagen}');">Agregar al carrito</button>
            `;
      productsSection.appendChild(productElement);
    }
  });
}
function DisplayProAdmin() {
  ListaProductosAD.innerHTML = " ";
  Productos.forEach((product) => {
    ListaProductosAD.innerHTML += ` <option value="${product.id}"> ${product.name} -${product.price} $ </option>`;
  });
  if (Productos.length > 0) {
    Previa.name.innerHTML = `${Productos[0].name}`;
    Previa.price.innerHTML = ` ${Productos[0].price} $`;
    Previa.img.src = `${Productos[0].imagen}`;
  } else {
    Previa.name.innerHTML = "Sin Productos";
    Previa.price.innerHTML = "0$";
    Previa.img.src = "/1/Proyectos/Shop/img/NoImg.jpg";
  }
}
ListaProductosAD.addEventListener("change", function () {
  var selectedOption = this.options[ListaProductosAD.selectedIndex];
  for (let i in Productos) {
    if (+selectedOption.value === Productos[i].id) {
      Previa.name.innerHTML = `${Productos[i].name} `;
      Previa.price.innerHTML = ` ${Productos[i].price} $`;
      Previa.img.src = `${Productos[i].imagen}`;
    }
  }
});
function AgregarCarro(idd, namee, pricee, image) {
  Carrito.push({
    id: idd,
    name: namee,
    price: pricee,
    imagen: image,
    numero: 0,
  });
  localStorage.setItem("carrt", JSON.stringify(Carrito));
  displayCart();
}
function displayCart() {
  const CartLit = document.getElementById("Cart-Items");
  CartLit.innerHTML = "";
  var total = 0;
  Carrito.forEach((e) => {
    const CarElemet = document.createElement("li");
    CarElemet.classList.add("CarEle");
    CarElemet.innerHTML = `<img src="${e.imagen}" alt="producto ${e.id}">
            <b> ${e.name} </b> - ${e.price} $
             <button onclick="EliminarDeCarrito(${e.id})">Eliminar</button>`;
    CartLit.appendChild(CarElemet);
    total += e.price;
  });
  document.getElementById("total").textContent = total;
}
function EliminarDeCarrito(Elem) {
  const Buscar = Carrito.findIndex((item) => item.id === Elem);
  if (Buscar !== -1) {
    Carrito.splice(Buscar, 1);
    localStorage.setItem("carrt", JSON.stringify(Carrito));
    displayCart();
  }
}

//mostrar siempre al principio la seccion de productos
Sections.Productos.style.display = "block";

//detectar cuando se preciona algun boton y activar la seccio de ese boton y desactivar las demas
for (let List in Botones) {
  Botones[List].addEventListener("click", () => {
    for (let Listt in Botones) {
      Sections[Listt].style.display = "none";
    }
    Sections[List].style.display = "block";
  });
}

//Filtrar productos
document.getElementById("Buscar").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  displayProducts(filter);
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Evita que el formulario se envíe

  const username = usernameInput.value;
  const password = passwordInput.value;
  // Validación simple
  if (username === "admin" && password === "admin") {
    form.style.display = "none";
    adminFun();
  } else {
    errorMessage.style.display = "block";
  }
});

function adminFun() {
  form.style.display = "none";
  adminPanel.style.display = "block";
  guardarEstadoSesion("true");
  document
    .getElementById("Imagen")
    .addEventListener("change", handleImageUpload);
}
// Función para guardar el estado de inicio de sesión en localStorage
function guardarEstadoSesion(estado) {
  localStorage.setItem("estaLogueado", estado);
}

// Función para verificar si el usuario está logeado al cargar la página
function verificarSesion() {
  const estaLogueado = localStorage.getItem("estaLogueado");
  if (estaLogueado === "true") {
    form.style.display = "none";
    adminPanel.style.display = "block";
    document
      .getElementById("Imagen")
      .addEventListener("change", handleImageUpload);
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("estaLogueado");
  form.style.display = "block";
  adminPanel.style.display = "none";
}

cerrarSesionButton.addEventListener("click", cerrarSesion);
//--------------------------------------
let newProductImage = null;
function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onloadend = function () {
    newProductImage = reader.result;
  };
  reader.readAsDataURL(file);
}
//
function agregarProducto() {
  const productName = document.getElementById("ProductName").value;
  const productPrice = document.getElementById("Price").value;
  const newProduct = {
    id: Productos.length + 1,
    name: productName,
    price: Number(productPrice),
    imagen: newProductImage,
  };
  Productos.push(newProduct);
  localStorage.setItem("productos", JSON.stringify(Productos));
  displayProducts();
  DisplayProAdmin();
  limpiarInputs();
}
function limpiarInputs() {
  document.getElementById("ProductName").value = "";
  document.getElementById("Price").value = "";
  document.getElementById("Imagen").value = "";
  newProductImage = null;
}
addProductButton.addEventListener("click", function (event) {
  Carrito = [];
  displayCart();
  localStorage.setItem("carrt", JSON.stringify(Carrito));
  event.preventDefault(); 
  agregarProducto();
});
deleteProductButton.addEventListener("click", function () {
  Carrito = [];
  displayCart();
  localStorage.setItem("carrt", JSON.stringify(Carrito));
  const selectedOption =
    ListaProductosAD.options[ListaProductosAD.selectedIndex];
  const productId = +selectedOption.value;
  Productos = Productos.filter((product) => product.id !== productId);
  localStorage.setItem("productos", JSON.stringify(Productos));
  displayProducts();
  DisplayProAdmin();
});
// Verificar si el usuario está logeado al cargar la página
verificarSesion();
displayCart();
DisplayProAdmin();
displayProducts();
