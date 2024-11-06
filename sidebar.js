document.addEventListener("DOMContentLoaded", async function () {
  const sidebarData = await fetchSidebarData();
  const sidebarContainer = document.getElementById("sidebar");

  let selectedFolder = null;
  let currentInput = null;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  sidebarContainer.appendChild(buttonContainer);

  const addFolderBtn = document.createElement("button");
  addFolderBtn.innerHTML = `<img src="icons/folder-add.png" class="folder-icon" />`;
  addFolderBtn.classList.add("add-folder-btn");
  addFolderBtn.title = "Add Folder";
  addFolderBtn.addEventListener("click", () => addNewItem("folder"));
  buttonContainer.appendChild(addFolderBtn);

  const addFileBtn = document.createElement("button");
  addFileBtn.innerHTML = `<img src="icons/file-add.png" class="file-icon" />`;
  addFileBtn.classList.add("add-file-btn");
  addFileBtn.title = "Add File";
  addFileBtn.addEventListener("click", () => addNewItem("file"));
  buttonContainer.appendChild(addFileBtn);

  const collapseAllBtn = document.createElement("button");
  collapseAllBtn.innerHTML = `<img src="icons/folder-closed.png" class="folder-icon" />`;
  collapseAllBtn.classList.add("collapse-all-btn");
  collapseAllBtn.title = "Collapse All Folders";
  collapseAllBtn.addEventListener("click", () => collapseAllFolders());
  buttonContainer.appendChild(collapseAllBtn);

  const collapseEverythingBtn = document.createElement("button");
  collapseEverythingBtn.innerHTML = `<img src="icons/collapse.png" class="folder-icon" />`;
  collapseEverythingBtn.classList.add("collapse-everything-btn");
  collapseEverythingBtn.title = "Collapse Everything";
  collapseEverythingBtn.addEventListener("click", () => collapseEverything());
  buttonContainer.appendChild(collapseEverythingBtn);

  const contentContainer = document.createElement("div");
  contentContainer.classList.add("sidebar-content");
  sidebarContainer.appendChild(contentContainer);

  renderSidebar(sidebarData, contentContainer);

  window.sidebarData = sidebarData;

  function collapseAllFolders() {
    const allCollapsible = document.querySelectorAll(".collapsible");
    const allFolderIcons = document.querySelectorAll(".folder .folder-icon");

    allCollapsible.forEach((element) => {
      element.classList.remove("open");
    });

    allFolderIcons.forEach((icon) => {
      icon.src = "icons/folder-closed.png";
    });
  }
  function collapseEverything() {
    const sidebarContent = document.querySelector(".sidebar-content");
    const buttonContainer = document.querySelector(".button-container");

    if (sidebarContent.style.display === "none") {
      sidebarContent.style.display = "block";
      collapseEverythingBtn.classList.remove("active");
    } else {
      sidebarContent.style.display = "none";
      collapseEverythingBtn.classList.add("active");
      collapseAllFolders();
    }
  }
});

function saveSidebarData() {
  localStorage.setItem("sidebarData", JSON.stringify(window.sidebarData));
}

async function fetchSidebarData() {
  const savedData = localStorage.getItem("sidebarData");

  if (savedData) {
    return JSON.parse(savedData);
  } else {
    const response = await fetch("sidebarData.json");
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch sidebar data.");
      return [];
    }
  }
}

function renderSidebar(data, container) {
  Array.from(container.children).forEach((child) => {
    if (
      !child.classList.contains("add-folder-btn") &&
      !child.classList.contains("add-file-btn")
    ) {
      container.removeChild(child);
    }
  });

  data.forEach((item) => {
    if (item.type === "folder") {
      renderFolder(item, container);
    } else if (item.type === "file") {
      renderFile(item, container);
    }
  });
}

function renderFolder(folder, container) {
  const folderElement = document.createElement("div");
  folderElement.classList.add("folder");

  const folderIcon = folder.open ? "folder-open.png" : "folder-closed.png";
  folderElement.innerHTML = `<img src="icons/${folderIcon}" class="folder-icon" /> ${folder.name}`;

  const childrenContainer = document.createElement("div");
  childrenContainer.classList.add("collapsible");

  folderElement.addEventListener("click", function (e) {
    e.stopPropagation();
    if (e.target.tagName !== "INPUT") {
      const isOpen = childrenContainer.classList.contains("open");
      childrenContainer.classList.toggle("open");

      const newIcon = isOpen ? "folder-closed.png" : "folder-open.png";
      folderElement.querySelector(".folder-icon").src = `icons/${newIcon}`;

      selectedFolder = folder;
    }
  });

  container.appendChild(folderElement);
  container.appendChild(childrenContainer);

  if (folder.children) {
    renderSidebar(folder.children, childrenContainer);
  }
}

function renderFile(file, container) {
  const fileElement = document.createElement("div");
  fileElement.classList.add("file");

  let iconSrc = "icons/file.png";
  if (file.name.endsWith(".js")) iconSrc = "icons/js.png";
  if (file.name.endsWith(".html")) iconSrc = "icons/html.png";
  if (file.name.endsWith(".png")) iconSrc = "icons/image.png";

  fileElement.innerHTML = `<img src="${iconSrc}" class="file-icon" /> ${file.name}`;
  container.appendChild(fileElement);
}

function addNewItem(type) {
  if (!selectedFolder) {
    alert("Please select a folder to add the new item.");
    return;
  }

  const childrenContainer = document.querySelectorAll(".folder + .collapsible");
  let targetContainer = null;

  childrenContainer.forEach((container) => {
    if (
      container.previousElementSibling &&
      container.previousElementSibling.textContent.trim() ===
        selectedFolder.name
    ) {
      targetContainer = container;
    }
  });

  if (targetContainer) {
    const existingInput = targetContainer.querySelector(".new-item-input");

    if (existingInput && existingInput.dataset.type === type) {
      existingInput.focus();
      return;
    }

    if (existingInput) {
      existingInput.remove();
    }

    const inputElement = document.createElement("input");
    inputElement.classList.add("new-item-input");
    inputElement.dataset.type = type;
    inputElement.placeholder = `Enter ${type} name`;

    targetContainer.appendChild(inputElement);
    targetContainer.classList.add("open");
    inputElement.focus();

    inputElement.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        const name = inputElement.value.trim();
        if (name) {
          const newItem = { name, type };
          selectedFolder.children = selectedFolder.children || [];
          selectedFolder.children.push(newItem);

          saveSidebarData();

          if (type === "file") {
            renderFile(newItem, targetContainer);
          } else if (type === "folder") {
            renderFolder(newItem, targetContainer);
          }

          inputElement.remove();
        } else {
          alert("Name cannot be empty.");
        }
      }
    });

    inputElement.addEventListener("blur", function () {
      setTimeout(() => {
        if (!targetContainer.querySelector(".new-item-input:focus")) {
          inputElement.remove();
        }
      }, 100);
    });
  }
}
