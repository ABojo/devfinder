//fetches user data
async function getUserData(username) {
  const response = await fetch(`/api/user/${username}`);
  const data = await response.json();

  return data;
}

//returns storage related functionality
const storage = (function () {
  const THEME_STORAGE_KEY = "darkMode";

  function getTheme() {
    return JSON.parse(localStorage.getItem(THEME_STORAGE_KEY));
  }

  function saveTheme(darkModeEnabled) {
    localStorage.setItem(THEME_STORAGE_KEY, darkModeEnabled);
  }

  function toggleTheme() {
    localStorage.setItem(THEME_STORAGE_KEY, !this.getTheme());
  }

  return { getTheme, saveTheme, toggleTheme };
})();

const formatters = {
  date: function (dateObject) {
    const date = new Date(dateObject);

    const day = date.getDay();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  },
  urlHref: function (urlString) {
    if (urlString.includes("http")) return urlString;

    return `http://${urlString}`;
  },
  urlText: function (urlString) {
    let currentString = urlString;

    if (urlString.includes("://")) {
      currentString = currentString.split("://")[1];
    }

    if (urlString.includes("www.")) {
      currentString = currentString.split("www.")[1];
    }

    if (currentString.length > 24) {
      currentString = currentString.slice(0, 22) + "...";
    }

    return currentString;
  },
};

const userCard = (function () {
  const userElement = document.querySelector(".user");

  const imageBoxElement = userElement.querySelector(".user__img");
  const imageElement = imageBoxElement.children[1];
  const nameElement = userElement.querySelector(".user__name");
  const dateElement = userElement.querySelector(".user__joined");
  const handleElement = userElement.querySelector(".user__handle");
  const bioElement = userElement.querySelector(".user__bio");

  if (imageElement.complete) {
    imageBoxElement.classList.remove("user__img--loading");
  }

  imageElement.addEventListener("load", () => {
    imageBoxElement.classList.remove("user__img--loading");
  });

  const repoElement = document.getElementById("repos");
  const followersElement = document.getElementById("followers");
  const followingElement = document.getElementById("following");

  const locationElement = document.getElementById("location");
  const twitterElement = document.getElementById("twitter");
  const websiteElement = document.getElementById("website");
  const companyElement = document.getElementById("company");

  const detailMap = [
    { element: locationElement, property: "location" },
    { element: twitterElement, property: "twitter" },
    { element: websiteElement, property: "website" },
    { element: companyElement, property: "company" },
  ];

  function updateImage(data) {
    const { avatarUrl, alt } = data;

    imageBoxElement.classList.add("user__img--loading");
    imageElement.src = avatarUrl;
    imageElement.alt = `${alt} profile picture`;
  }

  function updateHead(data) {
    const { name, username, joinDate, bio } = data;

    nameElement.textContent = name || "Empty Name";

    if (!name) {
      nameElement.classList.add("user__name--empty");
    } else {
      nameElement.classList.remove("user__name--empty");
    }

    handleElement.textContent = `@${username}`;
    dateElement.textContent = `Joined ${formatters.date(joinDate)}`;
    bioElement.textContent = bio || "This profile has no bio";
  }

  function updateStats(data) {
    const { repos, following, followers } = data;

    repoElement.textContent = repos;
    followersElement.textContent = following;
    followingElement.textContent = followers;
  }

  function updateDetails(data) {
    detailMap.forEach(({ element, property }) => {
      element.textContent = data[property] || "Not Available";

      if (!data[property]) {
        element.parentElement.classList.add("details__item--unavailable");
      } else {
        element.parentElement.classList.remove("details__item--unavailable");
      }
    });

    websiteElement.textContent = formatters.urlText(data.website) || "Not Available";
    websiteElement.href = formatters.urlHref(data.website);
  }

  function updateCard(userData) {
    const {
      avatarUrl,
      name,
      username,
      joinDate,
      bio,
      repos,
      followers,
      following,
      twitter,
      company,
      location,
      website,
    } = userData;

    updateImage({ avatarUrl, name });
    updateHead({ name, username, joinDate, bio });
    updateStats({ repos, following, followers });
    updateDetails({ twitter, location, company, website });
  }

  function toggleLoading() {
    userElement.classList.toggle("user--loading");
  }

  return { updateCard, toggleLoading };
})();

//setup form handling
(function () {
  const formElement = document.querySelector(".form");
  const errorElement = document.querySelector(".form__error");
  const usernameInput = document.querySelector(".form__input");
  const submitElement = document.querySelector(".form__submit");

  function setError(errorMessage) {
    errorElement.textContent = errorMessage;
    errorElement.classList.add("form__error--visible");
  }

  function removeError() {
    errorElement.classList.remove("form__error--visible");
  }

  function toggleLoading() {
    formElement.classList.toggle("form--loading");
    submitElement.disabled = !submitElement.disabled;
  }

  formElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!usernameInput.value) {
      return setError("Enter a username");
    }

    removeError();
    toggleLoading();
    userCard.toggleLoading();

    const userData = await getUserData(usernameInput.value);

    if (userData.status === "success") {
      userCard.updateCard(userData.data);
    } else {
      setError("No results");
    }

    toggleLoading();
    userCard.toggleLoading();
  });

  usernameInput.addEventListener("input", () => {
    removeError();
  });
})();

//setup theme toggling
(function () {
  const themeToggle = document.querySelector(".header__toggle");

  const DARK_SVG_STRING = `
    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <path
        d="M19.513 11.397a.701.701 0 00-.588.128 7.496 7.496 0 01-2.276 1.336 7.101 7.101 0 01-2.583.462 7.505 7.505 0 01-5.32-2.209 7.568 7.568 0 01-2.199-5.342c0-.873.154-1.72.41-2.49a6.904 6.904 0 011.227-2.21.657.657 0 00-.102-.924.701.701 0 00-.589-.128C5.32.61 3.427 1.92 2.072 3.666A10.158 10.158 0 000 9.83c0 2.8 1.125 5.342 2.967 7.19a10.025 10.025 0 007.16 2.98c2.353 0 4.527-.822 6.266-2.183a10.13 10.13 0 003.58-5.624.623.623 0 00-.46-.796z"
        fill="currentColor"
        fill-rule="nonzero"
        />
    </svg>`;

  const LIGHT_SVG_STRING = `
    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor" fill-rule="nonzero">
        <path
            d="M13.545 6.455c-.9-.9-2.17-1.481-3.545-1.481a4.934 4.934 0 00-3.545 1.481c-.9.9-1.481 2.17-1.481 3.545 0 1.376.582 2.646 1.481 3.545.9.9 2.17 1.481 3.545 1.481a4.934 4.934 0 003.545-1.481c.9-.9 1.481-2.17 1.481-3.545a4.934 4.934 0 00-1.481-3.545zM10 3.413a.7.7 0 00.688-.688V.688A.7.7 0 0010 0a.7.7 0 00-.688.688v2.037a.7.7 0 00.688.688zM15.635 5.344l1.455-1.455a.67.67 0 000-.952.67.67 0 00-.952 0l-1.455 1.455a.67.67 0 000 .952c.238.264.66.264.952 0zM19.312 9.312h-2.037a.7.7 0 00-.688.688.7.7 0 00.688.688h2.037A.7.7 0 0020 10a.7.7 0 00-.688-.688zM15.608 14.656a.67.67 0 00-.952 0 .67.67 0 000 .952l1.455 1.455a.67.67 0 00.952 0 .67.67 0 000-.952l-1.455-1.455zM10 16.587a.7.7 0 00-.688.688v2.037A.7.7 0 0010 20a.7.7 0 00.688-.688v-2.037a.7.7 0 00-.688-.688zM4.365 14.656L2.91 16.111a.67.67 0 000 .952.67.67 0 00.952 0l1.455-1.455a.67.67 0 000-.952c-.238-.264-.66-.264-.952 0zM3.413 10a.7.7 0 00-.688-.688H.688A.7.7 0 000 10a.7.7 0 00.688.688h2.037A.7.7 0 003.413 10zM4.365 5.344a.67.67 0 00.952 0 .67.67 0 000-.952L3.862 2.937a.67.67 0 00-.952 0 .67.67 0 000 .952l1.455 1.455z"
        />
        </g>
    </svg>
    `;

  function toggleTheme() {
    const isDarkModeEnabled = document.documentElement.classList.toggle("dark");

    if (isDarkModeEnabled) {
      themeToggle.innerHTML = `Light ${LIGHT_SVG_STRING}`;
    } else {
      themeToggle.innerHTML = `Dark ${DARK_SVG_STRING}`;
    }
  }

  const isDarkMode = storage.getTheme();

  if (isDarkMode) {
    document.documentElement.classList.toggle("dark");
    themeToggle.innerHTML = `Light ${LIGHT_SVG_STRING}`;
  } else {
    themeToggle.innerHTML = `Dark ${DARK_SVG_STRING}`;
  }

  themeToggle.addEventListener("click", () => {
    toggleTheme();
    storage.toggleTheme();
  });
})();
