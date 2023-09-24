import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

let requestWord;
let pageNum = 1;
const LOCAL_KEY = 'search-word';

const elements = {
  form: document.querySelector(`.search-form`),
  gallery: document.querySelector(`.gallery`),
  loadBtn: document.querySelector(`.load-more`),
};
console.log(elements);

elements.form.addEventListener(`submit`, submitHandler);

async function submitHandler(evt) {
  evt.preventDefault();
  requestWord = evt.target.elements.searchQuery.value;

  if (requestWord === '') {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );

    return;
  }
  try {
    const dataCards = await fetchPix(requestWord);
    const create = await createMarkup(dataCards);

    elements.gallery.insertAdjacentHTML(`beforeend`, create);
    elements.loadBtn.style.visibility = `visible`;
    pageNum++;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(requestWord));
    elements.loadBtn.addEventListener('click', loadMore);
  } catch (err) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } finally {
    evt.target.elements.searchQuery.value = '';
  }
}

async function loadMore() {
  moreReq = JSON.parse(localStorage.getItem(LOCAL_KEY));
  try {
    const dataCards = await fetchPix(moreReq);
    const create = await createMarkup(dataCards);

    elements.gallery.insertAdjacentHTML(`beforeend`, create);
  } catch (err) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } finally {
    pageNum++;
  }
}

async function fetchPix(requestWord) {
  const BASE_URL = `https://pixabay.com/api/`;
  const API_KEY = `39642997-acb236756d532ae28c959f640`;
  const params = {
    key: API_KEY,
    q: requestWord,
    image_type: `photo`,
    orientation: `horizontal`,
    safesearch: true,
    page: pageNum,
  };

  const resp = await axios.get(BASE_URL, { params });
  console.log(resp);

  if (resp.data.hits.length === 0) {
    return;
  }

  const data = await resp.data.hits;

  const result = await data.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      };
    }
  );

  return result;
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
                <div class="img-container"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></div>
                <div class="info">
                    <p class="info-item">
                        <b>Likes: ${likes}</b>
                    </p>
                    <p class="info-item">
                        <b>Views: ${views}</b>
                    </p>
                    <p class="info-item">
                        <b>Comments: ${comments}</b>
                    </p>
                    <p class="info-item">
                        <b>Downloads: ${downloads}</b>
                    </p>
                </div>
               </div>`
    )
    .join(``);
}
