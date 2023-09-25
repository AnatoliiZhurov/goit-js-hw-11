import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
console.log(SimpleLightbox);

let requestWord;
let pageNum = 1;
const LOCAL_KEY = 'search-word';
let countHits = 0;

const elements = {
  form: document.querySelector(`.search-form`),
  gallery: document.querySelector(`.gallery`),
  loadBtn: document.querySelector(`.load-more`),
};
console.log(elements);

let galleryLightbox = new SimpleLightbox('.gallery img', {
  sourceAttr: `data-src`,
  captionSelector: `self`,
  captionsData: 'alt',
  captionDelay: 0,
});

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

    countHits = dataCards.totalHits;

    Notify.info(`Hooray! We found ${countHits} images.`);

    elements.gallery.innerHTML = create;
    galleryLightbox.refresh();

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
  const moreReq = JSON.parse(localStorage.getItem(LOCAL_KEY));
  try {
    if (elements.gallery.childElementCount >= countHits) {
      throw new Error(err);
    }

    const dataCards = await fetchPix(moreReq);
    const create = await createMarkup(dataCards);

    elements.gallery.insertAdjacentHTML(`beforeend`, create);

    galleryLightbox.refresh();

    pageNum++;
  } catch (err) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
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
    per_page: 40,
  };

  const resp = await axios.get(BASE_URL, { params });

  const totalHits = resp.data.totalHits;

  const data = resp.data.hits;

  if (data.length === 0) {
    throw new Error(error);
  }

  const result = data.map(
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

  return { result, totalHits }; // Повертаємо об'єкт з результатами і загальною кількістю
}

function createMarkup({ result }) {
  return result
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
                <img src="${webformatURL}" alt="${tags}" data-src="${largeImageURL}" loading="lazy" />
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
