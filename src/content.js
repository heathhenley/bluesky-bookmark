// Helper function to create and add bookmark button
async function addBookmarkButton(postElement) {
  if (postElement.querySelector('.bookmark-button')) {
    return;
  }

  // find the post link, author and id
  const links = postElement.querySelectorAll('a')
  const postLink = Array.from(links).find(
    (link) => link.href.includes("/post/")).href;
  const author = postElement.querySelector(
    '[aria-label="View profile"]').textContent;
  // post id is the last part of the post link
  const postId = postLink.split('/').pop();


  // check if the post is already bookmarked
  existing = await chrome.storage.sync.get('bookmarks');
  const bookmarked = existing && existing.bookmarks.some(
    (bookmark) => bookmark.id === postId);

  console.log(postId, bookmarked);

  // create the button
  const button = document.createElement('button');
  button.className = 'bookmark-button';
  button.style.backgroundColor = 'transparent';
  button.style.border = 'none';

  // add svg icon of bookmark to the button
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('fill', 'none');
  if (bookmarked) {
    svg.setAttribute('fill', 'currentColor');
  }
  svg.setAttribute('stroke-width', '1');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('stroke', 'currentColor');
  svg.innerHTML = `<path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2l7-3 7 3a2 2 0 002-2V5a2 2 0 00-2-2H5z"></path>`;
  button.appendChild(svg);


  // position the button in the top right corner of the post
  button.style.position = 'absolute';
  button.style.top = '0';
  button.style.right = '0';
  button.style.zIndex = '1';

  button.addEventListener('click', async (event) => {
    // prevent the click event from propagating to the post
    event.preventDefault();

    // check if the post is already bookmarked
    const existing = await chrome.storage.sync.get('bookmarks');
    const alreadyBookmarked = existing && existing.bookmarks.some(
      (bookmark) => bookmark.id === postId);

    if (alreadyBookmarked) {
      unBookmarkPost(postId);
      svg.setAttribute('fill', 'none');
      return
    }

    // save in local storage
    bookmarkPost({
      author: author,
      url: postLink,
      id: postId
    });
    svg.setAttribute('fill', 'currentColor');

  });
  postElement.appendChild(button);
}

// Bookmark post by saving it to Chrome's local storage
function bookmarkPost(post) {
  chrome.storage.sync.get('bookmarks', (data) => {
    console.log(data);
    const updatedBookmarks = [...data.bookmarks, post];
    chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {});
  });
}

// Unbookmark post by removing it from Chrome's local storage
function unBookmarkPost(postId) {
  chrome.storage.sync.get('bookmarks', (data) => {
    const updatedBookmarks = data.bookmarks.filter(
      (bookmark) => bookmark.id !== postId);
    chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {});
  });
}

function handleIntersection(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const postElement = entry.target;
      addBookmarkButton(postElement);
      observer.unobserve(postElement);
    }
  });
}

const observer = new IntersectionObserver(handleIntersection,{
  root: null,
  rootMargin: '0px',
  threshold: 0.1
});


function injectBookmarkButtons() {
  // the post divs have a data-testid attribute that we can use to identify them
  // but that have the user name in them like:
  // data-testid="feedItem-by-<username>"
  if (window.location.pathname !== '/') {
    return;
  }
  const posts = document.querySelectorAll('[data-testid^="feedItem-"]');
  posts.forEach((post) => {
    observer.observe(post);
  });
}

// Run the injection function initially and on new posts
injectBookmarkButtons();
setInterval(injectBookmarkButtons, 2000); // Periodically check for new posts
