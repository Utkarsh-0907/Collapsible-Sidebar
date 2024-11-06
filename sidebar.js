document.addEventListener("DOMContentLoaded", async function () {
  const sidebarData = await fetchSidebarData();
  const sidebarContainer = document.getElementById("sidebar");

  const addFolderBtn = document.createElement("button");
  addFolderBtn.textContent = "➕ Add Folder";
  addFolderBtn.classList.add("add-folder-btn");
  addFolderBtn.addEventListener("click", addNewFolder);
  sidebarContainer.appendChild(addFolderBtn);

  const addFileBtn = document.createElement("button");
  addFileBtn.textContent = "📄 Add File";
  addFileBtn.classList.add("add-file-btn");
  addFileBtn.addEventListener("click", addNewRootFile);
  sidebarContainer.appendChild(addFileBtn);

  renderSidebar(sidebarData, sidebarContainer);

  window.sidebarData = sidebarData;
});

async function fetchSidebarData() {
  const response = await fetch("sidebarData.json");
  if (response.ok) {
    return await response.json();
  } else {
    console.error("Failed to fetch sidebar data.");
    return [];
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
  folderElement.innerHTML = `<img src="icons/folder.png" class="folder-icon" /> ${folder.name} 
          <span class="add-file" onclick="addFile('${folder.name}')">+</span>`;

  const childrenContainer = document.createElement("div");
  childrenContainer.classList.add("collapsible");

  folderElement.addEventListener("click", function (e) {
    if (e.target.tagName !== "SPAN") {
      childrenContainer.classList.toggle("open");
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

function addNewRootFile() {
  const fileName = prompt(
    "Enter the name of the new file in the root directory:"
  );

  if (fileName) {
    const newFile = { name: fileName, type: "file" };

    window.sidebarData.push(newFile);

    const sidebarContainer = document.getElementById("sidebar");
    renderFile(newFile, sidebarContainer);
  }
}

function addNewFolder() {
  const folderName = prompt("Enter the name of the new folder:");
  if (folderName) {
    const newFolder = { name: folderName, type: "folder", children: [] };
    window.sidebarData.push(newFolder);

    const sidebarContainer = document.getElementById("sidebar");
    renderFolder(newFolder, sidebarContainer);
  }
}

function findFolder(name, data) {
  for (const item of data) {
    if (item.name === name && item.type === "folder") {
      return item;
    }
    if (item.children) {
      const result = findFolder(name, item.children);
      if (result) return result;
    }
  }
  return null;
}

function addFile(folderName) {
  const fileName = prompt("Enter the name of the new file:");
  if (fileName) {
    const newFile = { name: fileName, type: "file" };

    const folder = findFolder(folderName, window.sidebarData);
    if (folder) {
      folder.children = folder.children || [];
      folder.children.push(newFile);

      const sidebarContainer = document.getElementById("sidebar");
      const folders = sidebarContainer.querySelectorAll(".folder");
      let folderDOM = null;

      folders.forEach((f) => {
        if (f.textContent.trim().includes(folderName)) {
          folderDOM = f.nextElementSibling;
        }
      });

      if (folderDOM) {
        renderFile(newFile, folderDOM);
        folderDOM.classList.add("open");
      }
    }
  }
}
