document.addEventListener("DOMContentLoaded", function () {
  const submitBuku = document.getElementById("inputBook");
  submitBuku.addEventListener("submit", function (event) {
    event.preventDefault();
    addBuku();
    Swal.fire("Buku berhasil ditambahkan", "", "success");
  });

  const pencarian = document.getElementById("searchBook");
  pencarian.addEventListener("submit", function (event) {
    event.preventDefault();
    cariJudulBuku();
  });

  if (isPenyimpanan()) {
    muatData();
  }
});

const bukuBuku = [];

function addBuku() {
  const judul = document.getElementById("inputBookTitle").value;
  const penulis = document.getElementById("inputBookAuthor").value;
  const tahun = Number(document.getElementById("inputBookYear").value);
  const isSelesai = document.getElementById("inputBookIsComplete").checked;

  const generateID = generateId();
  const objekBuku = generateObjekBuku(
    generateID,
    judul,
    penulis,
    tahun,
    isSelesai
  );
  bukuBuku.push(objekBuku);

  document.dispatchEvent(new Event(RENDER_EVENT));
  simpanData();
}

function generateId() {
  return +new Date();
}

function generateObjekBuku(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

const RENDER_EVENT = "render-buku";

document.addEventListener(RENDER_EVENT, function () {
  const belumBaca = document.getElementById("incompleteBookshelfList");
  belumBaca.innerHTML = "";

  const sudahBaca = document.getElementById("completeBookshelfList");
  sudahBaca.innerHTML = "";

  for (const buku of bukuBuku) {
    const bukuElement = tambahBuku(buku);
    if (!buku.isCompleted) {
      belumBaca.append(bukuElement);
    } else {
      sudahBaca.append(bukuElement);
    }
  }
});

function tambahBuku(objekBuku) {
  const textJudul = document.createElement("h3");
  textJudul.innerHTML = objekBuku.title;

  const textPenulis = document.createElement("p");
  textPenulis.innerHTML = "Penulis: " + objekBuku.author;

  const textTahun = document.createElement("p");
  textTahun.innerHTML = "Tahun: " + objekBuku.year;

  const container = document.createElement("article");
  container.append(textJudul, textPenulis, textTahun);
  container.classList.add("book_item");
  container.setAttribute("id", `buku-${objekBuku.id}`);

  if (objekBuku.isCompleted) {
    const pindahBelum = document.createElement("button");
    pindahBelum.classList.add("green");
    pindahBelum.innerText = "Belum selesai dibaca";

    pindahBelum.addEventListener("click", function () {
      BukuBelumDibaca(objekBuku.id);
    });

    const hapusButton = document.createElement("button");
    hapusButton.classList.add("red");
    hapusButton.innerText = "Hapus buku";

    hapusButton.addEventListener("click", function () {
      removeBuku(objekBuku.id);
    });

    const textContainer = document.createElement("div");
    textContainer.classList.add("action");
    textContainer.append(pindahBelum, hapusButton);
    container.append(textContainer);
  } else {
    const pindahBaca = document.createElement("button");
    pindahBaca.classList.add("green");
    pindahBaca.innerText = "Selesai dibaca";

    pindahBaca.addEventListener("click", function () {
      BukuSelesaiBaca(objekBuku.id);
    });

    const hapusButton = document.createElement("button");
    hapusButton.classList.add("red");
    hapusButton.innerText = "Hapus buku";

    hapusButton.addEventListener("click", function () {
      removeBuku(objekBuku.id);
    });

    const textContainer = document.createElement("div");
    textContainer.classList.add("action");
    textContainer.append(pindahBaca, hapusButton);
    container.append(textContainer);
  }
  return container;
}

function BukuSelesaiBaca(bukuId) {
  const bukuTarget = cariBuku(bukuId);

  if (bukuTarget == null) return;

  bukuTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  simpanData();
}

function BukuBelumDibaca(bukuId) {
  const bukuTarget = cariBuku(bukuId);

  if (bukuTarget == null) return;

  bukuTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  simpanData();
}

function removeBuku(bukuId) {
  const bukuTarget = cariBukuIndex(bukuId);

  if (bukuTarget === -1) return;

  Swal.fire({
    title: "Apa kamu yakin?",
    text: "Setelah dihapus, kamu tidak akan bisa mengembalikan buku ini!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "cornflowerblue",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Tidak"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Deleted!", "Your file has been deleted.", "success");
      bukuBuku.splice(bukuTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      simpanData();
    }
  });
}

function cariBuku(bukuId) {
  for (const buku of bukuBuku) {
    if (buku.id === bukuId) {
      return buku;
    }
  }
  return null;
}

function cariBukuIndex(bukuId) {
  for (const index in bukuBuku) {
    if (bukuBuku[index].id === bukuId) {
      return index;
    }
  }
  return -1;
}

document.addEventListener("click", function () {
  const isSelesai = document.getElementById("inputBookIsComplete");
  const gantitekstombol = document.getElementById("bookSubmit");

  if (isSelesai.checked == true) {
    gantitekstombol.innerHTML =
      "Masukkan Buku ke rak <span>Selesai dibaca</span>";
  } else {
    gantitekstombol.innerHTML =
      "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
  }
});

const SAVED_EVENT = "saved_book";
const STORAGE_KEY = "BOOKSELF_APP";

function simpanData() {
  if (isPenyimpanan()) {
    const parsed = JSON.stringify(bukuBuku);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isPenyimpanan() {
  if (typeof Storage === undefined) {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
}

function muatData() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const buku of data) {
      bukuBuku.push(buku);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function cariJudulBuku() {
  const pencarian = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const bukuBelumBaca = document.getElementById("incompleteBookshelfList");
  const bukuSudahBaca = document.getElementById("completeBookshelfList");

  bukuBelumBaca.innerHTML = "";
  bukuSudahBaca.innerHTML = "";

  for (const buku of bukuBuku) {
    if (buku.title.toLowerCase().includes(pencarian)) {
      const bukuElement = tambahBuku(buku);
      if (!buku.isCompleted) {
        bukuBelumBaca.append(bukuElement);
      } else {
        bukuSudahBaca.append(bukuElement);
      }
    }
  }
}
