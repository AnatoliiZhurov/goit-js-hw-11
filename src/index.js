import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchPix } from './partials/pix-api';

let requestWord;
let pageNum = 1;
const LOCAL_KEY = 'search-word';
let countHits = 0;

const elements = {
  form: document.querySelector(`.search-form`),
  gallery: document.querySelector(`.gallery`),
  loadBtn: document.querySelector(`.load-more`),
};

let galleryLightbox = new SimpleLightbox('.gallery img', {
  sourceAttr: `data-src`,
  captionSelector: `self`,
  captionsData: 'alt',
  captionDelay: 0,
});

elements.form.addEventListener(`submit`, submitHandler);

async function submitHandler(evt) {
  evt.preventDefault();
  pageNum = 1;
  elements.loadBtn.style.display = `block`;
  requestWord = evt.target.elements.searchQuery.value;

  if (requestWord === '') {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    elements.loadBtn.style.display = `none`;

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
    let actualHits = elements.gallery.childElementCount;
    checkCoutn(actualHits, countHits);
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

    let actualHits = elements.gallery.childElementCount;

    checkCoutn(actualHits, countHits);
  } catch (err) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
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

function checkCoutn(firstVal, secVal) {
  if (firstVal >= secVal) {
    elements.loadBtn.style.display = `none`;
  }
}

export { pageNum };
