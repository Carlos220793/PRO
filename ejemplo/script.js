// script.js

window.editar = editar;
window.eliminar = eliminar;
window.verHistorial = verHistorial;

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const usuarioInput = document.getElementById("usuario");
  const claveInput = document.getElementById("clave");
  const app = document.getElementById("app");
  const login = document.getElementById("login");
  const errorLogin = document.getElementById("error-login");
  const videoFondo = document.getElementById("video-fondo");

  const form = document.getElementById("form-registro");
  const lista = document.getElementById("lista");
  const buscarInput = document.getElementById("buscar-input");
  const resultados = document.getElementById("resultados");

  const btnRegistrar = document.getElementById("btn-registrar");
  const btnBuscar = document.getElementById("btn-buscar");
  const seccionRegistrar = document.getElementById("registrar");
  const seccionBuscar = document.getElementById("buscar");

  const modal = document.getElementById("modal-edicion");
  const cerrarModal = document.getElementById("cerrar-modal");
  const formEdicion = document.getElementById("form-edicion");

  const cerrarHistorial = document.getElementById("cerrar-historial");
  const exportarExcel = document.getElementById("exportar-excel");
  const filtrarFechas = document.getElementById("filtrar-fechas");

  // Login
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    if (usuarioInput.value.trim() === "Administrador" && claveInput.value.trim() === "sysadm1n") {
      errorLogin.textContent = "";
      login.classList.add("oculto");
      app.classList.remove("oculto");
      videoFondo.classList.remove("oculto");
      cargar();
    } else {
      errorLogin.textContent = "Credenciales incorrectas";
    }
  });

  // Navegación
  btnRegistrar.addEventListener("click", () => {
    seccionRegistrar.classList.remove("oculto");
    seccionBuscar.classList.add("oculto");
  });

  btnBuscar.addEventListener("click", () => {
    seccionRegistrar.classList.add("oculto");
    seccionBuscar.classList.remove("oculto");
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nuevo = {
      tipo: document.getElementById("tipo").value,
      placa: document.getElementById("placa").value,
      marca: document.getElementById("marca").value,
      serial: document.getElementById("serial").value,
      fecha: document.getElementById("fecha").value,
      tecnico: document.getElementById("tecnico").value,
      tipoMantenimiento: document.getElementById("tipo-mantenimiento").value,
      estado: document.getElementById("estado").value,
      ubicacion: document.getElementById("ubicacion").value,
      centroCosto: document.getElementById("centro-costo").value,
      urlTicket: document.getElementById("url-ticket").value,
      observaciones: document.getElementById("observaciones").value,
      historial: []
    };
    const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
    datos.push(nuevo);
    localStorage.setItem("mantenimientos", JSON.stringify(datos));
    form.reset();
    cargar();
  });

  function cargar() {
    const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
    lista.innerHTML = "";
    resultados.innerHTML = "";
    document.getElementById("total").textContent = datos.length;
    document.getElementById("pendientes").textContent = datos.filter(m => m.estado === "Pendiente").length;
    document.getElementById("en-progreso").textContent = datos.filter(m => m.estado === "En progreso").length;
    document.getElementById("finalizados").textContent = datos.filter(m => m.estado === "Finalizado").length;

    datos.forEach((m, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${m.tipo} - ${m.placa} - ${m.estado}
        <div>
          <button onclick="editar(${i})">Editar</button>
          <button onclick="eliminar(${i})">Eliminar</button>
          <button onclick="verHistorial(${i})">Historial</button>
        </div>
      `;
      lista.appendChild(li);
    });
  }

  buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();
    const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
    resultados.innerHTML = "";
    datos.filter(m => Object.values(m).some(v => String(v).toLowerCase().includes(texto)))
      .forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.tipo} - ${m.placa} - ${m.estado}`;
        resultados.appendChild(li);
      });
  });

  cerrarModal.addEventListener("click", () => modal.classList.add("oculto"));

  formEdicion.addEventListener("submit", e => {
    e.preventDefault();
    const i = document.getElementById("edit-indice").value;
    const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
    const anterior = { ...datos[i] };
    if (!datos[i].historial) datos[i].historial = [];
    datos[i].historial.push(anterior);

    datos[i] = {
      tipo: document.getElementById("edit-tipo").value,
      placa: document.getElementById("edit-placa").value,
      marca: document.getElementById("edit-marca").value,
      serial: document.getElementById("edit-serial").value,
      fecha: document.getElementById("edit-fecha").value,
      tecnico: document.getElementById("edit-tecnico").value,
      tipoMantenimiento: document.getElementById("edit-tipo-mantenimiento").value,
      estado: document.getElementById("edit-estado").value,
      ubicacion: document.getElementById("edit-ubicacion").value,
      centroCosto: document.getElementById("edit-centro-costo").value,
      urlTicket: document.getElementById("edit-url-ticket").value,
      observaciones: document.getElementById("edit-observaciones").value,
      historial: datos[i].historial
    };
    localStorage.setItem("mantenimientos", JSON.stringify(datos));
    modal.classList.add("oculto");
    cargar();
  });

  exportarExcel.addEventListener("click", () => {
    const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
    const hoja = datos.map(m => ({
      Tipo: m.tipo,
      Placa: m.placa,
      Marca: m.marca,
      Serial: m.serial,
      Fecha: m.fecha,
      Técnico: m.tecnico,
      Tipo_Mantenimiento: m.tipoMantenimiento,
      Estado: m.estado,
      Ubicación: m.ubicacion,
      Centro_Costo: m.centroCosto,
      URL_Ticket: m.urlTicket,
      Observaciones: m.observaciones
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(hoja);
    XLSX.utils.book_append_sheet(wb, ws, "Mantenimientos");
    XLSX.writeFile(wb, "mantenimientos.xlsx");
  });

  filtrarFechas.addEventListener("click", () => {
    const desde = document.getElementById("filtro-desde").value;
    const hasta = document.getElementById("filtro-hasta").value;
    const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
    let filtrados = datos.filter(m => {
      if (!m.fecha) return false;
      if (desde && m.fecha < desde) return false;
      if (hasta && m.fecha > hasta) return false;
      return true;
    });
    resultados.innerHTML = "";
    filtrados.forEach(m => {
      const li = document.createElement("li");
      li.textContent = `${m.tipo} - ${m.placa} - ${m.fecha}`;
      resultados.appendChild(li);
    });
  });

  cerrarHistorial.addEventListener("click", () => {
    document.getElementById("modal-historial").classList.add("oculto");
  });
});

function editar(i) {
  const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
  const m = datos[i];
  document.getElementById("edit-indice").value = i;
  document.getElementById("edit-tipo").value = m.tipo;
  document.getElementById("edit-placa").value = m.placa;
  document.getElementById("edit-marca").value = m.marca;
  document.getElementById("edit-serial").value = m.serial;
  document.getElementById("edit-fecha").value = m.fecha;
  document.getElementById("edit-tecnico").value = m.tecnico;
  document.getElementById("edit-tipo-mantenimiento").value = m.tipoMantenimiento;
  document.getElementById("edit-estado").value = m.estado;
  document.getElementById("edit-ubicacion").value = m.ubicacion;
  document.getElementById("edit-centro-costo").value = m.centroCosto;
  document.getElementById("edit-url-ticket").value = m.urlTicket;
  document.getElementById("edit-observaciones").value = m.observaciones;
  document.getElementById("modal-edicion").classList.remove("oculto");
}

function eliminar(i) {
  const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
  if (confirm("¿Seguro que deseas eliminar este mantenimiento?")) {
    datos.splice(i, 1);
    localStorage.setItem("mantenimientos", JSON.stringify(datos));
    document.getElementById("lista").innerHTML = "";
    document.getElementById("resultados").innerHTML = "";
    cargar();
  }
}

function verHistorial(i) {
  const datos = JSON.parse(localStorage.getItem("mantenimientos") || "[]");
  const historial = datos[i].historial || [];
  const historialLista = document.getElementById("historial-lista");
  historialLista.innerHTML = "";
  if (historial.length === 0) {
    historialLista.innerHTML = "<li>No hay historial disponible.</li>";
  } else {
    historial.forEach((h, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `<b>Versión ${idx + 1}</b> - ${h.fecha}<br>Tipo: ${h.tipo} | Técnico: ${h.tecnico} | Estado: ${h.estado}`;
      historialLista.appendChild(li);
    });
  }
  document.getElementById("modal-historial").classList.remove("oculto");
}