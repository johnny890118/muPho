export const api = {
  getHotPhoto: (pgNum = 1) => `https://api.pexels.com/v1/curated?page=${pgNum}&per_page=50`,
  getSearchPhoto: (input, pgNum = 1) =>
    `https://api.pexels.com/v1/search?query=${input}&per_page=50&page=${pgNum}`,
};
