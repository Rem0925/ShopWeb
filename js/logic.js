//Botones de las secciones------------------------------------------------------------------------
const Botones = {
  Productos: document.getElementById("products_BTN"),
  Carrito: document.getElementById("cart_BTN"),
  Admin: document.getElementById("admin_BTN"),
};
//Referencia a cada una de las secciones de la pagina------------------------------------------------
const Sections = {
  Productos: document.getElementById("products"),
  Carrito: document.getElementById("cart"),
  Admin: document.getElementById("admin"),
};
//Referencia a varias cosas-------------------------------------------------------------------------
const form = document.getElementById("Login");
const adminPanel = document.getElementById("Ad_Pan");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("Error");
const cerrarSesionButton = document.getElementById("cerrarSesion");
const ListaProductosAD = document.getElementById("listProduct");
//Referncia a la vista previa de los productos en la seccion de eliminar-----------------------------
const Previa = {
  name: document.getElementById("NombreProAd"),
  price: document.getElementById("PriceProAd"),
  img: document.getElementById("ImgProAd"),
};
//Referencia a los botones de agregar producto y eliminar en la seccion admin-------------------------
const addProductButton = document.getElementById("Agregar");
const deleteProductButton = document.getElementById("BorrarProducto");

//Lista de productos por defecto y los que se pueden editar para mostrar en la pagina-----------------
var Productos = JSON.parse(localStorage.getItem("productos")) /*Deberia pedir de una bases de datos en vez del local storage */?? [
  {
    id: 1,
    name: "Producto 1",
    price: 10,
    imagen: "img/NoImg.jpg",
  },
  {
    id: 2,
    name: "Producto 2",
    price: 15,
    imagen: "img/NoImg.jpg",
  },
  {
    id: 3,
    name: "Producto 3",
    price: 150,
    imagen: "img/NoImg.jpg",
  },
  {
    id: 4,
    name: "Producto 4",
    price: 100,
    imagen: "img/NoImg.jpg",
  },
];
//Carrito de compras------------------------------------------------------------------------------------
var Carrito = JSON.parse(localStorage.getItem("carrt"))/*Lo mismo que con los productos, el local storage*/ || [];


//Mostrar todos los productos de array Productos en la pestaña "Productos"--------------------------------------------------
function displayProducts(filter = "") {
  const productsSection = document.getElementById("Products_all");
  productsSection.innerHTML = " ";
  Productos.forEach((product) => {
    if (product.name.toLowerCase().includes(filter.toLowerCase())) { //filtrar los productos segun el valor de filter
      const productElement = document.createElement("div");
      productElement.classList.add("product");

      productElement.innerHTML = `
            <h3>${product.name} </h3>
            <p>${product.price} $</p>
            <img src="${product.imagen}" alt="producto ${product.id}">
            <button class="Agre" id="BT_${product.id}" data-product="${product.id},${product.name},${product.price},${product.imagen}"  
            onclick="AgregarCarro(${product.id},'${product.name}',${product.price},
            '${product.imagen}'); disableButton(this);" >Agregar al carrito</button>
            `;
      productsSection.appendChild(productElement);
    }
  });
}
//Mostrar la lista de productos en la seccion admin-----------------------------------------------------------
function DisplayProAdmin() {
  ListaProductosAD.innerHTML = " ";
  Productos.forEach((product) => {
    ListaProductosAD.innerHTML += ` <option value="${product.id}"> ${product.name} -${product.price} $ </option>`;
  });
  if (Productos.length > 0) {//Si hay mas de un produto, mostrar el primero por defecto
    Previa.name.innerHTML = `${Productos[0].name}`;
    Previa.price.innerHTML = ` ${Productos[0].price} $`;
    Previa.img.src = `${Productos[0].imagen}`;
  } else {//si no hay ningun producto nostras eso de abajo
    Previa.name.innerHTML = "Sin Productos";
    Previa.price.innerHTML = "0$";
    Previa.img.src = "img/NoImg.jpg";
  }
}
//Cuando se seleccione otra opcion de la lista de productos en la pestaña admin, mostras visualmente el producto seleccionado-------------------------------
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
//Cada vez que se cargue la pagina verificar si algun producto esta en el carrito para asi desabilitar el boton de agregar-----------------
function VerificarCompra() {
  Carrito.forEach((item) => {
    const button = document.getElementById(`BT_${item.id}`);
    if (button) {
      disableButton(button);
    }
  });
}
//funcion de desactivar el boton de agregar al carrito--------------------------------------------------------------------------------------
function disableButton(btn) {
  btn.disabled = true;
  btn.onclick = null;
  btn.innerHTML = "En el Carrito";
}
//Agregar el producto al carrito----------------------------------------------------------------------------------------
function AgregarCarro(idd, namee, pricee, image) {
  Carrito.push({
    id: idd,
    name: namee,
    price: pricee,
    imagen: image,
    numero: 0,
    cantidad: 1,
  });
  localStorage.setItem("carrt", JSON.stringify(Carrito));//se guarda en el local storage a falta de base de datos :(
  displayCart();
}

//Mostar visualmente los productos que estan en Carrito en su respectiva pestaña--------------------------------------------------
function displayCart() {
  const CartLit = document.getElementById("Cart-Items");
  CartLit.innerHTML = "";
  var total = 0;
  Carrito.forEach((e) => {
    const CarElemet = document.createElement("li");
    CarElemet.classList.add("CarEle");
    CarElemet.innerHTML = `<button class="CantB i" onclick="SumarP(${
      e.id
    });"><i class="bi bi-plus-circle-fill"></i></button> <div class="Cant"> ${
      e.cantidad
    } </div> <button class="CantB" onclick="RestarP(${
      e.id
    });"><i class="bi bi-dash-circle-fill"></i></button>
     <img src="${e.imagen}" alt="producto ${e.id}">
            <b> ${e.name} </b> - ${e.price} $ - tot: ${e.price * e.cantidad} $
             <button onclick="EliminarDeCarrito(${e.id})">Eliminar</button>`;
    CartLit.appendChild(CarElemet);
    total += e.price * e.cantidad;
  });
  document.getElementById("total").textContent = total;
}
//funcion para disminuir la cantidad de productos de un mismo tipo a comprar----------------------------------------------------------------
function RestarP(elemt1) {
  var Buscar = Carrito.findIndex((item) => item.id === elemt1);
  if (Carrito[Buscar].cantidad > 1) {
    Carrito[Buscar].cantidad = Carrito[Buscar].cantidad - 1;
    displayCart();
    localStorage.setItem("carrt", JSON.stringify(Carrito));//Deberia guardarse el carrito en una base de datos
  }
}
//funcion para aumente la cantidad de productos de un mismo tipo a comprar-------------------------------------------------------
function SumarP(elemt1) {
  var Buscar = Carrito.findIndex((item) => item.id === elemt1);
  if (Carrito[Buscar].cantidad < 9) {
    Carrito[Buscar].cantidad = Carrito[Buscar].cantidad + 1;
    displayCart();
    localStorage.setItem("carrt", JSON.stringify(Carrito));
  }
}
function EliminarDeCarrito(Elem) {
  const Buscar = Carrito.findIndex((item) => item.id === Elem);
  if (Buscar !== -1) {
    Carrito.splice(Buscar, 1);
    localStorage.setItem("carrt", JSON.stringify(Carrito));//igualmente aqui
    displayCart();
  }
}
//mostrar siempre al principio la seccion de productos--------------------------------------------------------------------
Sections.Productos.style.display = "block";

//detectar cuando se preciona algun boton y activar la seccio de ese boton y desactivar las demas--------------------------------------
for (let List in Botones) {
  Botones[List].addEventListener("click", () => {
    for (let Listt in Botones) {
      Sections[Listt].style.display = "none";
    }
    Sections[List].style.display = "block";
  });
}

//Filtrar productos--------------------------------------------------------------------------------------------------------
document.getElementById("Buscar").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  displayProducts(filter);
});

//Agregar un producto a la lista desde la pestaña admin----------------------------------------------------------------------------
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Evita que el formulario se envíe
 // Validación simple (Seguridad Nula xd)
  const username = usernameInput.value;
  const password = passwordInput.value;
  if (username === "admin" && password === "admin") {
    form.style.display = "none";
    adminFun();
  } else {
    errorMessage.style.display = "block";
  }
});
//Mostrar el panel de admin y ocultar el inicio de sesion-----------------------------------------------------
function adminFun() {
  form.style.display = "none";
  adminPanel.style.display = "block";
  guardarEstadoSesion("true");
  document
    .getElementById("Imagen")
    .addEventListener("change", handleImageUpload);
}
// Función para guardar el estado de inicio de sesión en localStorage----------------------------------------
function guardarEstadoSesion(estado) {
  localStorage.setItem("estaLogueado", estado);
}

// Función para verificar si el usuario está logeado al cargar la página------------------------------------------
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

// Función para cerrar sesión---------------------------------------------------------------------------
function cerrarSesion() {
  localStorage.removeItem("estaLogueado");
  form.style.display = "block";
  adminPanel.style.display = "none";
}

cerrarSesionButton.addEventListener("click", cerrarSesion);

//Parte sacada de internet para convertir un imagen subida en una ruta para guardarla en el local storage xd--------------------------------------
let newProductImage = null;
function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onloadend = function () {
    newProductImage = reader.result;
  };
  reader.readAsDataURL(file);
}
//Agrego el porducto nuevo--------------------------------------------------------------------
function agregarProducto() {
  const productName = document.getElementById("ProductName").value;
  const productPrice = document.getElementById("Price").value;
  const newProduct = {
    id: Productos.length + 1,
    name: productName,
    price: Number(productPrice),
    imagen: newProductImage ?? "img/NoImg.jpg",
  };
  Productos.push(newProduct);
  localStorage.setItem("productos", JSON.stringify(Productos));//se guarda los productos en ya saben donde >:(
  displayProducts();
  DisplayProAdmin();
  limpiarInputs();
}
//limpia los imputs al agregar el producto---------------------------------------------------------------------
function limpiarInputs() {
  document.getElementById("ProductName").value = "";
  document.getElementById("Price").value = "";
  document.getElementById("Imagen").value = "";
  newProductImage = null;
}
//Al dar click al boton de agregar producto pues se agrega a la lista de productos----------------------------------------------------
addProductButton.addEventListener("click", function (event) {
  Carrito = [];
  displayCart();
  localStorage.setItem("carrt", JSON.stringify(Carrito));//se guarda Carrito
  event.preventDefault();
  agregarProducto();
});
//Eliminar el producto seleccionado en la lista al pulsar el boton----------------------------------------------------------
deleteProductButton.addEventListener("click", function () {
  Carrito = [];
  displayCart();
  localStorage.setItem("carrt", JSON.stringify(Carrito));//Se guarda Carrito pero vacio
  const selectedOption =
    ListaProductosAD.options[ListaProductosAD.selectedIndex];
  const productId = +selectedOption.value;
  Productos = Productos.filter((product) => product.id !== productId);
  localStorage.setItem("productos", JSON.stringify(Productos));//se guarda la modificacion de la lista de productos
  displayProducts();
  DisplayProAdmin();
});
//mostrar el footer al llegar al fondo de la pagina y al dar scroll-----------------------------------------------------------------
let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const footer = document.querySelector("footer");
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  if (scrollTop > lastScrollY) {
    footer.style.transform = "translateY(0)";
  } else {
    footer.style.transform = "translateY(100%)";
  }
  if (scrollTop + windowHeight >= documentHeight) {
    footer.style.transform = "translateY(0)";
  }
  lastScrollY = scrollTop;
});
//Mostrar el footer en las pestañas que no tienen scroll al dar click a la pagina-------------------------------------------------------
document.addEventListener("click", () => {
  const footer = document.querySelector("footer");
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  if (documentHeight - 100 <= windowHeight) {
    footer.style.transform = "translateY(0)";
  } else {
    footer.style.transform = "translateY(100%)";
  }
});
//Mostrar en la consola cuanto espacio del local storage hemos usado (Por si acaso)-----------------------------------------------------------
function getLocalStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2;
    }
  }
  console.log(`Total space used in localStorage: ${total} bytes`);
  return total;
}
//Llamar todas la funciones importantes al cargar la pagina-----------------------------------------------------------------
verificarSesion();
displayCart();
DisplayProAdmin();
displayProducts();
VerificarCompra();
getLocalStorageSize()