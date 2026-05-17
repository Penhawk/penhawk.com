document.addEventListener("DOMContentLoaded", function () {

  const form = document.querySelector("form");
  const dropArea = document.querySelector(".file-drop-area");
  const inputs = document.querySelectorAll("#file-input-container input");
  const preview = document.getElementById("file-preview");
  const sizeDisplay = document.getElementById("file-size-display");
  const alertBox = document.getElementById("file-alert");

  const maxBytes = 50 * 1024 * 1024;
  let totalBytes = 0;

  let usedSlots = new Array(inputs.length).fill(false);

  const picker = document.createElement("input");
  picker.type = "file";
  picker.multiple = true;
  picker.style.display = "none";
  document.body.appendChild(picker);

  function getNextAvailableSlot() {
    return usedSlots.findIndex(slot => slot === false);
  }

  /* ---------------------------
     HELPERS
  --------------------------- */

  function truncateFilename(name, max) {
    return name.length > max ? name.slice(0, max) + '...' : name;
  }

  /* ---------------------------
     ALERT SYSTEM
  --------------------------- */

  function showError(message) {
    alertBox.textContent = message;
    alertBox.classList.add("visible", "error");
    dropArea.classList.add("error-state");
  }

  function clearError() {
    alertBox.classList.remove("visible", "error");
    dropArea.classList.remove("error-state");
  }

  /* ---------------------------
     VALIDATION STATE
  --------------------------- */

  function updateValidationState() {

  const remainingBytes = maxBytes - totalBytes;
  const remainingMB = remainingBytes / 1024 / 1024;

  sizeDisplay.textContent =
    `残り: ${remainingMB.toFixed(2)} MB / 50 MB`;

  sizeDisplay.classList.remove("size-warning", "size-limit");

  const percentageUsed = totalBytes / maxBytes;

  if (percentageUsed > 0.75 && percentageUsed < 1) {
    sizeDisplay.classList.add("size-warning");
  }

  if (percentageUsed >= 1) {
    sizeDisplay.classList.add("size-limit");
  }

  /* animate update */

  sizeDisplay.classList.remove("size-updated");

  void sizeDisplay.offsetWidth; // force reflow

  sizeDisplay.classList.add("size-updated");

  if (totalBytes <= maxBytes) {
    clearError();
  }
}

  /* ---------------------------
     FILE HANDLING
  --------------------------- */

  function handleFiles(files) {

    Array.from(files).forEach(file => {

      const slotIndex = getNextAvailableSlot();

      if (slotIndex === -1) {
        showError("最大15ファイルまで添付できます。");
        return;
      }

      const wouldExceed = totalBytes + file.size > maxBytes;

      if (wouldExceed) {
        showError("合計50MBを超えています。");
      }

      const dt = new DataTransfer();
      dt.items.add(file);
      inputs[slotIndex].files = dt.files;

      usedSlots[slotIndex] = true;
      totalBytes += file.size;

      addPreview(file, slotIndex, wouldExceed);
      updateValidationState();

      dropArea.classList.add("has-files");

    });
  }

  function addPreview(file, slotIndex, invalid = false) {

    const item = document.createElement("div");
    item.className = "file-preview-item";
    item.dataset.slot = slotIndex;

    if (invalid) {
      item.classList.add("file-invalid");
    }

    const extension = file.name.split('.').pop().toUpperCase();
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);

    const badge = document.createElement("span");
    badge.className = "file-type-badge";
    badge.textContent = extension;

    const name = document.createElement("span");
    name.className = "file-preview-name";
    name.textContent = truncateFilename(file.name, 30);
    name.title = file.name;

    const size = document.createElement("span");
    size.className = "file-preview-size";
    size.textContent = `${fileSizeMB} MB`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "file-remove-btn";
    removeBtn.textContent = "削除";

    removeBtn.addEventListener("click", function () {

      inputs[slotIndex].value = "";
      usedSlots[slotIndex] = false;
      totalBytes -= file.size;

      item.classList.add("removing");

      setTimeout(() => {
        item.remove();
      }, 200);

      if (totalBytes === 0) {
        dropArea.classList.remove("has-files");
      }

      updateValidationState();
    });

    const leftGroup = document.createElement("div");
    leftGroup.className = "file-preview-left";

    leftGroup.appendChild(badge);
    leftGroup.appendChild(name);

    item.appendChild(leftGroup);
    item.appendChild(size);
    item.appendChild(removeBtn);

    preview.appendChild(item);
  }

  /* ---------------------------
     FORM SUBMISSION
  --------------------------- */

  form.addEventListener("submit", function (e) {

    let realTotal = 0;
    let fileCount = 0;

    inputs.forEach(input => {
      for (let i = 0; i < input.files.length; i++) {
        realTotal += input.files[i].size;
        fileCount++;
      }
    });

    if (realTotal > maxBytes) {
      e.preventDefault();
      showError("合計50MBを超えています。ファイルを減らしてください。");
      return;
    }

    if (fileCount > 15) {
      e.preventDefault();
      showError("最大15ファイルまで添付できます。");
      return;
    }

  });

  /* ---------------------------
     DROP AREA EVENTS
  --------------------------- */

  dropArea.addEventListener("click", () => picker.click());

  picker.addEventListener("change", e => {
    handleFiles(e.target.files);
    picker.value = "";
  });

  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });

  document.addEventListener("dragover", e => e.preventDefault());
  document.addEventListener("drop", e => e.preventDefault());

  updateValidationState();

});
