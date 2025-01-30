const imagesWrapper = document.querySelector(".images");
const loadMoreBtn = document.querySelector(".load-more");
const searchInput = document.querySelector(".search-box input");
const lightBox = document.querySelector(".lightbox");
const closeBtn = lightBox.querySelector(".uil-times");
const downloadImgBtn = lightBox.querySelector(".uil-import");

// API key, pagination, and searchTerm variables
const apikey = "hycPQYubWNYgBqUAgRCvGNttxwOeJ0iZultzFj5zNWXmyObCsQAED3qW";
const perpage = 15;
let currentPage = 1;
let searchTerm = null;

// Download image function
const downloadImg = (imgURL) => {
  fetch(imgURL)
    .then((res) => res.blob())
    .then((file) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(file);
      a.download = `image_${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href); // Clean up
    })
    .catch(() => {
      console.error("Failed to download the image.");
      alert("Failed to download the image. Please try again.");
    });
};

const showLightbox = (namae, img) => {
  // Showing lightbox and setting img source, name
    lightBox.querySelector("img").src = img;
    lightBox.querySelector("span").innerText = name;
    downloadImgBtn.setAttribute("data-img", img);
    lightBox.classList.add("show");
    document.body.style.overflow = "hidden";
}

const hideLightbox = () => {
  lightBox.classList.remove("show");
  document.body.style.overflow = "auto";

}

// Generate API URL
const getApiURL = () => {
  return searchTerm
    ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perpage}`
    : `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perpage}`;
};

// Generate HTML for images and append to the wrapper
const generateHTML = (images) => {
  const html = images.map(
    (img) => `
      <li class="card" onclick="showLightbox('${img.photographer}', '${img.src.large2x}')">
        <img src="${img.src.large2x}" alt="Image by ${img.photographer}">
        <div class="details">
          <div class="photographer">
            <i class="uil uil-camera"></i>
            <span>${img.photographer}</span>
          </div>
          <button class="download-btn" data-url="${img.src.large2x});event.stopPropagation();">
            <i class="uil uil-import"></i>
          </button>
        </div>
      </li>`
  ).join("");
  imagesWrapper.innerHTML += html;

  // Attach download listeners
  document.querySelectorAll(".download-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => downloadImg(e.target.closest("button").dataset.url))
  );
};

// Fetch images from the API
const getImages = () => {
  setLoadingState(true);
  fetch(getApiURL(), {
    headers: { Authorization: apikey },
  })
    .then((res) => res.json())
    .then((data) => {
      setLoadingState(false);
      generateHTML(data.photos);
    })
    .catch((err) => {
      setLoadingState(false);
      console.error("Error fetching images:", err);
      imagesWrapper.innerHTML = `<p class="error">Failed to load images. Please try again later.</p>`;
    });
};

// Update UI for loading state
const setLoadingState = (isLoading) => {
  loadMoreBtn.innerText = isLoading ? "Loading..." : "Load More";
  loadMoreBtn.classList.toggle("disabled", isLoading);
};

// Load more images
const loadMoreImages = () => {
  currentPage++;
  getImages();
};

// Load images based on search input
const loadSearchImages = (e) => {
  if (e.target.value.trim() === "") {
    searchTerm = null;
    return;
  }
  if (e.key === "Enter") {
    currentPage = 1;
    searchTerm = e.target.value.trim();
    imagesWrapper.innerHTML = ""; // Clear existing images
    getImages();
  }
};

// Initial API call for curated images
getImages();

// Event listeners
loadMoreBtn.addEventListener("click", loadMoreImages);
searchInput.addEventListener("keydown", loadSearchImages);
closeBtn.addEventListener("click", hideLightbox);
downloadImgBtn.addEventListener("click", (e) => downloadImg(e.target.dataset.img));