import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// Tu configuración de la aplicación web de Firebase (la que te proporcionaron)
const firebaseConfig = {
    apiKey: "AIzaSyBjym0GyVjRLIsMLtoAw1VdQiB_FxFvR8U",
    authDomain: "prueba-base-de-datos-f40c2.firebaseapp.com",
    projectId: "prueba-base-de-datos-f40c2",
    storageBucket: "prueba-base-de-datos-f40c2.firebasestorage.app", // Corregí el dominio a .appspot.com
    messagingSenderId: "793853601385",
    appId: "1:793853601385:web:12185d570535965cb364f8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar los servicios de Firestore y Storage
const db = getFirestore(app);
const storage = getStorage(app);

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
const HacerPedidoBTN = document.getElementById("Comprar_BTN");
//Referncia a la vista previa de los productos en la seccion de eliminar-----------------------------
const Previa = {
  name: document.getElementById("NombreProAd"),
  price: document.getElementById("PriceProAd"),
  img: document.getElementById("ImgProAd"),
  fileInput: document.getElementById("fileInput"),
  edit: document.getElementById("Editt"),
  id: 0,
};
var EditarProducto = false;
//Referencia a los botones de agregar producto y eliminar en la seccion admin-------------------------
const addProductButton = document.getElementById("Agregar");
const deleteProductButton = document.getElementById("BorrarProducto");

//Carrito de compras------------------------------------------------------------------------------------
var Carrito =
  JSON.parse(
    localStorage.getItem("carrt")
  ) /*Lo mismo que con los productos, el local storage*/ || [];
//Mostrar todos los productos de array Productos en la pestaña "Productos"--------------------------------------------------
async function displayProducts(filter = "") {
  const productsSection = document.getElementById("Products_all");
  productsSection.innerHTML = "Cargando productos...";

  const productsCollection = collection(db, "productos");
  const querySnapshot = await getDocs(productsCollection);
  const productosFirebase = [];
  querySnapshot.forEach((doc) => {
    productosFirebase.push({ id: doc.id, ...doc.data() });
  });

  productsSection.innerHTML = " ";
  productosFirebase.forEach((product) => {
    if (product.name.toLowerCase().includes(filter.toLowerCase())) {
      const productElement = document.createElement("div");
      productElement.classList.add("product");
      productElement.innerHTML = `
            <h3>${product.name} </h3>
            <p>${product.price} $ </p>
            <img src="${product.imagen}" alt="producto ${product.id}">
            <button class="Agre" id="BT_${product.id}"
            onclick="AgregarCarro('${product.id}','${product.name}',${product.price},
            '${product.imagen}'); disableButton(this);" >Agregar al carrito</button>
            `;
      productsSection.appendChild(productElement);
    }
  });
  VerificarCompra();
}
//Mostrar la lista de productos en la seccion admin-----------------------------------------------------------
async function DisplayProAdmin() {
    ListaProductosAD.innerHTML = "<option>Cargando...</option>";
    
    const productsCollection = collection(db, "productos");
    const querySnapshot = await getDocs(productsCollection);
    const productosFirebase = [];
    querySnapshot.forEach((doc) => {
      productosFirebase.push({ id: doc.id, ...doc.data() });
    });
  
    ListaProductosAD.innerHTML = " ";
    productosFirebase.forEach((product) => {
      ListaProductosAD.innerHTML += ` <option value="${product.id}"> ${product.name} -${product.price} $ </option>`;
    });
  
    if (productosFirebase.length > 0) {
      const firstProduct = productosFirebase[0];
      Previa.name.value = firstProduct.name;
      Previa.price.value = firstProduct.price;
      Previa.img.src = firstProduct.imagen;
      Previa.id = firstProduct.id;
    } else {
      Previa.name.value = "Sin Productos";
      Previa.price.value = 0;
      Previa.img.src = "img/NoImg.jpg";
      Previa.id = 0;
    }
}
//Cuando se seleccione otra opcion de la lista de productos en la pestaña admin, mostras visualmente el producto seleccionado-------------------------------
ListaProductosAD.addEventListener("change", async function () {
    var selectedOption = this.options[ListaProductosAD.selectedIndex];
    // Necesitamos obtener todos los productos de nuevo para encontrar el seleccionado
    const productsCollection = collection(db, "productos");
    const querySnapshot = await getDocs(productsCollection);
    querySnapshot.forEach((doc) => {
        if (doc.id === selectedOption.value) {
            const productData = doc.data();
            Previa.name.value = `${productData.name} `;
            Previa.price.value = productData.price;
            Previa.img.src = `${productData.imagen}`;
            Previa.id = doc.id;
        }
    });
});
//Editar los productos ya existentes desde la pestaña admin-------------------------------------------------------------
let productoEditImg = null;
async function EditarPro() {
    LimpiarCarrito();
    EditarProducto = !EditarProducto;
  
    if (EditarProducto == true && Previa.id !== 0) {
      Previa.name.disabled = false;
      Previa.price.disabled = false;
      Previa.edit.innerHTML = `<i class="bi bi-check2-circle"></i>`;
      Previa.img.addEventListener("click", handleImageClick);
      Previa.img.style.border = "1px solid #4c5353 ";
    } else {
      Previa.img.style.border = "1px solid transparent";
      Previa.edit.innerHTML = `<i class="bi bi-pencil-square">`;
      Previa.name.disabled = true;
      Previa.price.disabled = true;
      
      const productId = Previa.id;
      if (productId === 0) return;
  
      const updatedData = {
        name: Previa.name.value.trim(),
        price: Number(Previa.price.value.trim()),
      };
  
      try {
          const newImageFile = Previa.fileInput.files[0];
          if (newImageFile) {
              const storageRef = ref(storage, `productos/${Date.now()}_${newImageFile.name}`);
              const snapshot = await uploadBytes(storageRef, newImageFile);
              updatedData.imagen = await getDownloadURL(snapshot.ref);
              Previa.img.src = updatedData.imagen;
          }
  
          const productDoc = doc(db, "productos", productId);
          await updateDoc(productDoc, updatedData);
          alert("Producto actualizado con éxito.");
          
          DisplayProAdmin();
          displayProducts();
  
      } catch (error) {
          console.error("Error al actualizar el producto:", error);
          alert("Hubo un error al actualizar el producto.");
      }
  
      Previa.fileInput.value = "";
      Previa.img.removeEventListener("click", handleImageClick);
    }
}
//abri un input tipo file al darle a la imagen
function handleImageClick() {
  Previa.fileInput.click();
}
//Ajustar el tamaño del iframe de el Pedido, dependiendo del tamaño del contenido
window.resizeIframe = function() {
  const iframe = document.getElementById("content-iframe");
  const iframeDocument =
    iframe.contentDocument || iframe.contentWindow.document;
  iframe.style.height = iframeDocument.body.scrollHeight + "px";
  iframe.style.width = iframeDocument.body.scrollWidth + "px";
}

//imagen---------------------------------------------------------------------------------------------------
Previa.fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    // Simplemente mostramos una vista previa local
    Previa.img.src = URL.createObjectURL(file);
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
window.disableButton = function(btn) {
  btn.disabled = true;
  btn.onclick = null;
  btn.innerHTML = "En el Carrito";
}
//Agregar el producto al carrito----------------------------------------------------------------------------------------
window.AgregarCarro = function(idd, namee, pricee, image) {
  Carrito.push({
    id: idd,
    name: namee,
    price: pricee,
    imagen: image,
    numero: 0,
    cantidad: 1,
  });
  localStorage.setItem("carrt", JSON.stringify(Carrito)); //se guarda en el local storage a falta de base de datos :(
  displayCart();
}

//Mostar visualmente los productos que estan en Carrito en su respectiva pestaña--------------------------------------------------
var total = 0;
function displayCart() {
  const BotonesCar = document.getElementById("Botones-Carrito");
  const CartLit = document.getElementById("Cart-Items");
  CartLit.innerHTML = "";
  total = 0;
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

  if (Carrito.length > 0) {
    BotonesCar.style.display = "block";
  } else {
    BotonesCar.style.display = "none";
  }
}
//Mostrar el apartado del pedido al presionar el boton de hacer compra
window.toggleIframe = function(show) {
  const contentHolder = document.getElementById("content-holder");
  contentHolder.style.visibility = show ? "visible" : "hidden";
}
//Guardar el pedido como imagen
window.GuardarImg = function() {
  const iframe = document.getElementById("content-iframe");
  // Usar html2canvas para capturar el iframe
  html2canvas(iframe.contentWindow.document.body).then((canvas) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "Ticket.png"; // Nombre del archivo
    link.click();
  });
  toggleIframe(false);
}
//mostrar el boton guardar al hacer el pedido dentro del iframeS
window.addEventListener(
  "message",
  function (event) {
    if (event.data === "activarBotonGuardar") {
      document.getElementById("Gr").style.display = "block";
      LimpiarCarrito();
    }
  },
  false
);

//funcion para disminuir la cantidad de productos de un mismo tipo a comprar----------------------------------------------------------------
window.RestarP = function(elemt1) {
  var Buscar = Carrito.findIndex((item) => item.id === elemt1);
  if (Carrito[Buscar].cantidad > 1) {
    Carrito[Buscar].cantidad = Carrito[Buscar].cantidad - 1;
    displayCart();
    localStorage.setItem("carrt", JSON.stringify(Carrito)); //Deberia guardarse el carrito en una base de datos
  }
}
//funcion para aumente la cantidad de productos de un mismo tipo a comprar-------------------------------------------------------
window.SumarP = function(elemt1) {
  var Buscar = Carrito.findIndex((item) => item.id === elemt1);
  if (Carrito[Buscar].cantidad < 9) {
    Carrito[Buscar].cantidad = Carrito[Buscar].cantidad + 1;
    displayCart();
    localStorage.setItem("carrt", JSON.stringify(Carrito)); //igualmente aqui
  }
}
//Quitar elemento del carrito de compras--------------------------------------------------------------------
function EliminarDeCarrito(Elem) {
  const Buscar = Carrito.findIndex((item) => item.id === Elem);
  if (Buscar !== -1) {
    Carrito.splice(Buscar, 1);
    localStorage.setItem("carrt", JSON.stringify(Carrito));
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

//Iniciar sesion com admin----------------------------------------------------------------------------
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Evita que el formulario se envíe
  // Validación simple (Seguridad Nula xd)------------------------------------------------------
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
  }
}

// Función para cerrar sesión---------------------------------------------------------------------------
function cerrarSesion() {
  localStorage.removeItem("estaLogueado");
  form.style.display = "block";
  adminPanel.style.display = "none";
}

cerrarSesionButton.addEventListener("click", cerrarSesion);
//Agrego el producto nuevo--------------------------------------------------------------------
async function agregarProducto() {
    const productName = document.getElementById("ProductName").value;
    const productPrice = document.getElementById("Price").value;
    const imageFile = document.getElementById("Imagen").files[0];

    if (productPrice < 1 || !productName) {
        alert("Por favor, completa el nombre y un precio válido.");
        return;
    }

    let imageUrl = "img/NoImg.jpg";

    if (imageFile) {
        const storageRef = ref(storage, `productos/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
    }

    const newProduct = {
        name: productName,
        price: Number(productPrice),
        imagen: imageUrl,
    };

    try {
        await addDoc(collection(db, "productos"), newProduct);
        alert("¡Producto agregado con éxito!");
        displayProducts();
        DisplayProAdmin();
        limpiarInputs();
    } catch (error) {
        console.error("Error al agregar el producto: ", error);
        alert("Hubo un error al agregar el producto.");
    }
}
//limpia los imputs al agregar el producto---------------------------------------------------------------------
function limpiarInputs() {
  document.getElementById("Price").style.backgroundColor = "white";
  document.getElementById("ProductName").value = "";
  document.getElementById("Price").value = "";
  document.getElementById("Imagen").value = "";
  newProductImage = null;
}
//Al dar click al boton de agregar producto pues se agrega a la lista de productos----------------------------------------------------
addProductButton.addEventListener("click", function (event) {
  LimpiarCarrito();
  event.preventDefault();
  agregarProducto();
});
//Eliminar el producto seleccionado en la lista al pulsar el boton----------------------------------------------------------
deleteProductButton.addEventListener("click", async function () {
    LimpiarCarrito();
    const selectedOption = ListaProductosAD.options[ListaProductosAD.selectedIndex];
    if (!selectedOption || !selectedOption.value) {
        alert("Por favor, selecciona un producto para eliminar.");
        return;
    }
    
    const productId = selectedOption.value;

    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
        try {
            await deleteDoc(doc(db, "productos", productId));
            alert("Producto eliminado correctamente.");
            displayProducts();
            DisplayProAdmin();
        } catch (error) {
            console.error("Error al eliminar el producto: ", error);
            alert("Hubo un error al eliminar el producto.");
        }
    }
});
//Vaciar el Carrito-----------------------------------------------------------------------------
window.LimpiarCarrito = function() {
  Carrito = [];
  displayCart();
  localStorage.setItem("carrt", JSON.stringify(Carrito)); //Se guarda Carrito pero vacio
}
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
getLocalStorageSize();
