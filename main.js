document.addEventListener("DOMContentLoaded", async () => {
  const radar = document.getElementById("radar");
  const addBlipForm = document.getElementById("add-blip-form");
  const techModal = new bootstrap.Modal(document.getElementById("techModal"));

  // IDs de elementos del modal
  const modalTechName = document.getElementById("modal-tech-name");
  const modalTechCategory = document.getElementById("modal-tech-category");
  const modalTechQuadrant = document.getElementById("modal-tech-quadrant")
  const modalTechRing = document.getElementById("modal-tech-ring");
  const modalTechDescription = document.getElementById("modal-tech-description");
  const modalTechLink = document.getElementById("modal-tech-link");

  // Configuración de los anillos
  const rings = [25, 50, 100, 150, 200];
  const centerX = radar.clientWidth / 2;
  const centerY = radar.clientHeight / 2;

  // API Endpoint
  const apiUrl = "https://localhost:44347/api/Blips";

  // Dibuja anillos del radar
  rings.forEach((radius) => {
    const ring = document.createElement("div");
    ring.className = "ring";
    ring.style.width = `${radius * 2}px`;
    ring.style.height = `${radius * 2}px`;
    ring.style.left = "50%";
    ring.style.top = "50%";
    ring.style.transform = "translate(-50%, -50%)";
    radar.appendChild(ring);
  });

  // Dibuja líneas de los cuadrantes
  const horizontalLine = document.createElement("div");
  horizontalLine.className = "quadrant-line horizontal";
  radar.appendChild(horizontalLine);

  const verticalLine = document.createElement("div");
  verticalLine.className = "quadrant-line vertical";
  radar.appendChild(verticalLine);

  // Función para mostrar el modal con información del blip
  const showTechModal = (blip) => {
      if (!modalTechName || !modalTechCategory || !modalTechQuadrant || 
            !modalTechRing || !modalTechDescription || !modalTechLink) {
      console.error("One or more modal elements are missing in the DOM.");
      return;
    }

    modalTechName.textContent = blip.name;
    modalTechCategory.textContent = blip.category;
    modalTechQuadrant.textContent =
      blip.quadrant === 0 ? "Alto Impacto" : "Bajo Impacto";
    modalTechRing.textContent = ["Adoptar", "Prueba", "Evaluar", "En Espera"][
      blip.ring
    ];
    modalTechDescription.textContent = blip.description || "No disponible";
    modalTechLink.href = blip.link || "#";
    modalTechLink.textContent = blip.link ? "Ver artículo" : "No disponible";

    techModal.show();
  };

  // Dibuja un blip en el radar
  const drawBlip = (blip) => {
    // Crea el elemento visual del blip
    const blipElement = document.createElement("div");
    blipElement.className = "blip";
    blipElement.style.left = `${blip.x - 6}px`;
    blipElement.style.top = `${blip.y - 6}px`;
    radar.appendChild(blipElement);

    // Crea el label del blip
    const label = document.createElement("div");
    label.className = "blip-label";
    label.textContent = blip.name;
    label.style.left = `${blip.x}px`;
    label.style.top = `${blip.y + 10}px`;
    radar.appendChild(label);

    // Evento para abrir el modal al hacer clic en el blip
    blipElement.addEventListener("click", () => showTechModal(blip));
  };

  // Carga blips desde la API
  const loadBlipsFromAPI = async () => {
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const blips = await response.json();
        blips.forEach((blip) => drawBlip(blip));
      } else {
        console.error("Error loading blips from API:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // Maneja el envío del formulario para agregar un nuevo blip
  addBlipForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtiene valores del formulario
    const name = document.getElementById("tech-name").value;
    const category = document.getElementById("tech-category").value;
    const quadrant = parseInt(document.getElementById("tech-quadrant").value);
    const ring = parseInt(document.getElementById("tech-ring").value);
    const link = document.getElementById("tech-link").value;
    const description = document.getElementById("tech-description").value;

    // Calcula posición
    const angle = (Math.PI / 2) * quadrant + Math.random() * (Math.PI / 2);
    const distance =
      Math.random() * (rings[ring + 1] - rings[ring]) + rings[ring];
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    // Crea el nuevo blip
    const newBlip = { name, category, quadrant, ring, link, description, x, y };

    try {
      // Envia al backend
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlip),
      });

      if (response.ok) {
        // Dibuja el blip en el radar si el guardado es exitoso
        drawBlip(newBlip);
        addBlipForm.reset();
      } else {
        const errorText = await response.text();
        console.error("Error saving blip:", errorText);
        alert(`Error saving the blip on the server: ${errorText}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("A network error occurred. Check your server connection.");
    }
  });

  // Carga los blips al cargar la página
  loadBlipsFromAPI();
});