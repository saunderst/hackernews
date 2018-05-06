const DONE = 4;
const OK = 200;
const TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const ONE_PAGE = 30;
let globalArticleIndex = 0;  // track where we are in the list of articles as pages are loaded
let globalArticleList = [];  // fetch this once at the beginning

readJSONFile = (path, data) => {
  return new Promise((resolve, reject) => {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', path);
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === DONE) {
        if (httpRequest.status === OK) {
          resolve(JSON.parse(httpRequest.responseText));
        } else {
          reject(httpRequest.status, httpRequest.responseText);
        }
      }
    };
    httpRequest.send();
  })
}

// generate one entry on the news page
articleToHackerHTML = (seq, article) => {
  let site = article.url ? (new URL(article.url)).hostname.replace("www.","") : null;
  return (
    `<span class="article-num">${seq}. </span>` +
    `<a href="${article.url}" class="article-title">${article.title}</a>` +
    (site ? `<span class="article-site"> (<a href="https://news.ycombinator.com/from?site=${site}">${site})</a></span>` : "") +
    `<br><span class="article-num"> </span>` +
    `<span class="article-bottom-line">` +
      `${article.score} points by ` +
      `<a href="https://news.ycombinator.com/user?id=${article.by}">${article.by}</a> ${moment(article.time*1000).fromNow()} | hide | ` +
      (article.descendants ? `<a href="https://news.ycombinator.com/item?id=${article.id}">${article.descendants} comments</a>` : "discuss") +
    `</span>` +
    `<span class="between-articles"> </span>`
  );
}

document.addEventListener("DOMContentLoaded", event => { 
  // This tag lets us know that we're in the right place to do all this stuff.
  if (document.getElementById("hacker-index")) {
    moment.relativeTimeRounding(Math.floor);    // The original Hacker News seems to round relative times down, and so shall we.
    readJSONFile(TOP_STORIES_URL).then((articleList) => {
      globalArticleList = articleList;
      renderHackerNewsPage();    
    });
  }
});

renderHackerNewsPage = () => {
  let JSONPromises = [];
  for (let articleIndex = globalArticleIndex ; articleIndex < globalArticleIndex + ONE_PAGE; ++articleIndex) {
    JSONPromises.push(readJSONFile(`https://hacker-news.firebaseio.com/v0/item/${globalArticleList[articleIndex]}.json`));
  }
  Promise.all(JSONPromises).then((articleList) => {
    let newsPageHTML = "";
    for (let articleIndex = 0; articleIndex < ONE_PAGE; ++articleIndex) {
      newsPageHTML += articleToHackerHTML(articleIndex + 1, articleList[articleIndex]);
    }
    let newsPageElement = document.getElementById("news-page"); // Here's where we insert articles for display.
    // if this is the first time we're doing this, remove any placeholder content from the page
    if (globalArticleIndex === 0) {
      while (newsPageElement.childNodes.length > 0) {
        newsPageElement.removeChild(newsPageElement.childNodes[0]);
      }
    }
    newsPageElement.insertAdjacentHTML("beforeend", newsPageHTML);
    globalArticleIndex += ONE_PAGE;
  });

}

// var elem  = document.getElementById("ff");
// window.addEventListener('scroll', fixit);
// function fixit() {
//   let diff = elem.getBoundingClientRect().bottom - document.documentElement.clientHeight;
//     if (diff <= 0) {
//       elem.style.position="fixed";
//     }
// }