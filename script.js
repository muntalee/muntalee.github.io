// JavaScript
const hamburgerButton = document.querySelector('.hamburger');
const menuOverlay = document.querySelector('.menu-overlay');

hamburgerButton.addEventListener('click', () => {
  menuOverlay.classList.toggle('menu-overlay--active');
});

// Close the menu overlay when clicking outside of it
document.addEventListener('click', (event) => {
  const targetElement = event.target;
  if (!targetElement.closest('.hamburger') && !targetElement.closest('.menu-overlay')) {
    menuOverlay.classList.remove('menu-overlay--active');
  }
});

// GITHUB REPOS

// Retrieve all card container elements
const cardContainers = document.querySelectorAll(".github-repo-card");

// Loop through each card container
cardContainers.forEach(cardContainer => {
  // Retrieve the username and repository from the data attributes
  const username = cardContainer.getAttribute("data-username");
  const repo = cardContainer.getAttribute("data-repo");

  // Generate the GitHub repo card using JavaScript
  const card = document.createElement("div");
  card.className = "github-card";
  card.innerHTML = `
                <h3>${username}/${repo}</h3>
                <p>Loading...</p>
            `;
  cardContainer.appendChild(card);

  // Fetch repo data from GitHub API
  fetch(`https://api.github.com/repos/${username}/${repo}`)
    .then(response => response.json())
    .then(data => {
      // Update the card with the fetched data
      card.innerHTML = `
                        <a href="https://github.com/${username}/${repo}"><h3>${repo}</h3></a>
                        <p>${data.description}</p>
                        <p>Language: ${data.language}</p>
                        <p>⭑: ${data.stargazers_count}</p>
                        <p>Ψ: ${data.forks_count}</p>
                    `;
    })
    .catch(error => {
      // Display an error message if there's an issue fetching the data
      card.innerHTML = `<p>Error: ${error.message}</p>`;
    });
});