const { TOKEN } = require("./js/auth");

//add class to element
function addClass(item, styleClass) {
  document.getElementById(item).classList.add(styleClass);
}

//remove class from element
function removeClass(item, styleClass) {
  document.getElementById(item).classList.remove(styleClass);
}

//clear search and reset state
function clearSearch() {
  removeClass("main-content", "show");
  addClass("initial-text", "show");
}

//add effects to specified elements on scroll
function scroll() {
  if (window.scrollY > 50) {
    addClass("link-holder", "top");
    addClass("profile-main", "optional-info");
    addClass("tab-link-profile", "show");
  } else {
    removeClass("link-holder", "top");
    removeClass("profile-main", "optional-info");
    removeClass("tab-link-profile", "show");
  }
}

function detailToggle(item) {
  document.getElementById(item).classList.toggle("show");
}

//get an element and add text content
function getElementIdAndAddTextContent(element_id, text_content) {
  document.getElementById(element_id).textContent = text_content;
}

//get an element and append an element to it
function getElementIdAndAppendContent(element_id, content) {
  document.getElementById(element_id).append(content);
}

//create main holder for the repository cards
function createHolder() {
  let mainHolder = document.createElement("div");
  mainHolder.id = "repo-detail-holder-id";
  getElementIdAndAppendContent("repository-body-cards", mainHolder);
}

//check and perform functions on input
function searchTextChange(search_text) {
  if (search_text.length === 0) {
    removeClass("search-input-dropdown", "show");
    return;
  }
  let searchValue = search_text;
  let searchButton = document.getElementById("search-button");
  getElementIdAndAddTextContent(
    "search-button",
    `Search for '${searchValue}'   
  `
  );
  searchButton.value = searchValue;
  searchButton.addEventListener("click", (e) => {
    getRepos(e.target.value);
  });
  addClass("search-input-dropdown", "show");
}

async function getRepos(user) {
  let baseURL = "https://api.github.com/graphql";
  let searchTerm = user;
  removeClass("search-input-dropdown", "show");
  removeClass("initial-text", "show");
  removeClass("main-content", "show");
  addClass("loading", "show");
  addClass("loader-img", "show");
  document.getElementById("searchfield").setAttribute("disabled", true); //disable input while searching
  getElementIdAndAddTextContent("error-message", ''); //remove any previous error message
  await fetch(baseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      query: `{
        viewer {
          login
          repositories(affiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}, first: 20, privacy: PUBLIC) {
            edges {
              node {
                id
                updatedAt
                name
                stargazerCount
                primaryLanguage {
                    name
                    color
                  }
              }
            }
          }
          starredRepositories {
            totalCount
          }
        }
        user(login: "${searchTerm}") {
            name
            repositories(orderBy: {field: UPDATED_AT, direction: DESC}, first: 20) {
              totalCount
              edges {
                node {
                  name
                  primaryLanguage {
                    color
                    name
                  }
                  updatedAt
                }
              }
            }
          bio
          email
          avatarUrl
          following {
            totalCount
          }
          followers {
            totalCount
          }
          starredRepositories {
            totalCount
          }
        
        }
      }`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
    document.getElementById("searchfield").removeAttribute("disabled");
      if (data.data.user === null) {
        handleDataErrors(`User '${searchTerm}' not found`);
        return;
      }
      if (data.errors) {
        handleDataErrors(data.errors[0].message);
        return;
      }
      populateData(data.data);
      removeClass("loading", "show");
      addClass("main-content", "show");
    })
    .catch((error) => {
     document.getElementById("searchfield").removeAttribute("disabled");
      handleDataErrors(error);
    });
}

//handle errors
function handleDataErrors(error_message) {
  console.error("Error", error_message);
  getElementIdAndAddTextContent("error-message", error_message);
  removeClass("loader-img", "show");
}
//populate the data
function populateData(data) {
  let mainHolder = document.getElementById("repo-detail-holder-id");
  //if an element which hold repository cards exists, remove it and create a new one else just create one
  if (mainHolder) {
    mainHolder.remove();
    createHolder();
  } else {
    createHolder();
  }
  let { viewer, user } = data;
  document.querySelectorAll(".avatar").forEach((item) => {
    item.src = user.avatarUrl;
    item.alt = user.name;
  });
  getElementIdAndAddTextContent("main-name", user.name);
  getElementIdAndAddTextContent("name-alias", user.login);
  getElementIdAndAddTextContent("user-bio", user.bio);
  document.querySelector("#tab-link-profile span").textContent = user.login;
  getElementIdAndAddTextContent("user-email", user.email);
  getElementIdAndAddTextContent("followers", user.followers.totalCount);
  getElementIdAndAddTextContent("following", user.following.totalCount);
  getElementIdAndAddTextContent("gazers", user.starredRepositories.totalCount);
  document
    .querySelectorAll(".repo-count")
    .forEach((item) => (item.textContent = user.repositories.repositories));
  let populate = user.repositories.edges.filter((edge) => {
    return edge.node.primaryLanguage !== null;
  });
  populate.forEach((item) => {
    let details = item.node;
    let repoDetailHolder = document.createElement("div");
    repoDetailHolder.className = "repository-body-card d-flex justify-between";
    let repoDetails = `
      <div class="d-flex repo-details">
      <a href="#" class="repo-name"> ${details.name} </a>
  
      <div class="d-flex"> <span> <small class="repo-color" style='background-color: ${
        details.primaryLanguage.color
      }'></small> ${
      details.primaryLanguage.name
    } </span> <span> Updated  ${getDate(details.updatedAt)}</span> </div>
  
    </div>
  
    <button class="star d-flex"> <i class="fa fa-star-o"></i> <span>Star</span> </button>
      `;
    repoDetailHolder.innerHTML = repoDetails;
    getElementIdAndAppendContent("repo-detail-holder-id", repoDetailHolder);
  });
}

//date string manipulation
function getDate(datestr) {
  let now = new Date().getTime();
  let dateString = new Date(datestr).getTime();
  let dateDifference = Math.abs(dateString - now);
  let dateUpdated = Math.round(
    parseFloat(dateDifference / (1000 * 60 * 60 * 24), 10)
  );
  if (dateUpdated < 1) {
    return `${Math.round(
      parseFloat(dateDifference / (1000 * 60 * 60), 10)
    )} hours ago`;
  }

  if (dateUpdated > 20) {
    return new Date(datestr).toDateString().substr(4, 6);
  }
  return `${dateUpdated} days ago`;
}

module.exports = {
  detailToggle: detailToggle,
  appScroll: scroll,
  appAddClass: addClass,
  appRemoveClass: removeClass,
  clearSearch: clearSearch,
  getElementIdAndAddTextContent: getElementIdAndAddTextContent,
  searchTextChange: searchTextChange,
  getRepos: getRepos,
  populateData: populateData,
  getDate: getDate,
}; //export functions so they are accessible globally

//getRepos();
