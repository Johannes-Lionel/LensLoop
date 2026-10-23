// Select key DOM elements
const searchForm = document.getElementById("search-form");
const searchInput = document.querySelector("#search-form input");
const resultsContainer = document.getElementById("results");
const resultCount = document.getElementById("result-count");
const chips = document.querySelectorAll(".chip");

// Function to fetch and render images
async function fetchImages(query) {
  // Ignore empty searches
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;

  // Clear previous results
  resultsContainer.innerHTML = "";
  if (resultCount) {
    resultCount.textContent = "Searching...";
  }

  // Wikimedia Commons Search API URL
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    trimmedQuery
  )}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|mime|extmetadata&format=json&origin=*`;

  try {
    const response = await fetch(url);

    // Verify response status
    if (!response.ok) {
      if (resultCount) resultCount.textContent = "Error loading images.";
      return;
    }

    const data = await response.json();
    const pages = data.query ? data.query.pages : null;

    if (!pages) {
      if (resultCount) resultCount.textContent = `No results found for "${trimmedQuery}"`;
      return;
    }

    const items = Object.values(pages);

    // Update result count display
    if (resultCount) {
      resultCount.textContent = `Showing ${items.length} results for "${trimmedQuery}"`;
    }

    // Loop through results and create visual cards
    items.forEach((item) => {
      const imageInfo = item.imageinfo ? item.imageinfo[0] : null;
      if (!imageInfo || !imageInfo.url) return;

      // Filter for standard image types
      const mime = imageInfo.mime || "";
      if (!mime.startsWith("image/")) return;

      // Extract title and cleaned captions
      const rawTitle = item.title.replace(/^File:/i, "").replace(/\.[^/.]+$/, "");
      const artist = imageInfo.extmetadata?.Artist?.value
        ? imageInfo.extmetadata.Artist.value.replace(/<[^>]*>/g, "")
        : "Wikimedia Commons";

      // Build Card Element
      const card = document.createElement("div");
      card.className = "card";

      // Card HTML with link to open original high-res image in a new tab
      card.innerHTML = `
        <a href="${imageInfo.url}" target="_blank" rel="noopener noreferrer">
          <img src="${imageInfo.url}" alt="${rawTitle}" loading="lazy">
        </a>
        <div class="card-body">
          <h3 class="card-title">${rawTitle}</h3>
          <p class="card-artist">By: ${artist}</p>
        </div>
      `;

      resultsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Fetch error:", error);
    if (resultCount) resultCount.textContent = "Failed to fetch images.";
  }
}

// 1. Handle search form submit
if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent page reload
    const query = searchInput.value;
    fetchImages(query);
  });
}

// 2. Enhancement: Wire up suggestion category chips to run searches on click
if (chips.length > 0) {
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const categoryText = chip.textContent.trim();
      searchInput.value = categoryText;
      fetchImages(categoryText);
    });
  });
}