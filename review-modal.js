(() => {
  const current = location.pathname.split('/').pop();
  const initialFormat = current === 'audiobook.html' ? 'audio' : 'text';
  const dialog = document.createElement('dialog');
  dialog.className = 'review-dialog';
  dialog.setAttribute('aria-labelledby', 'review-dialog-title');
  dialog.innerHTML = `
    <div class="review-modal-inner">
      <div class="review-modal-head"><h2 id="review-dialog-title">Как вам товар?</h2><button class="review-close" type="button" aria-label="Закрыть">×</button></div>
      <div class="review-product"><img src="book.webp" alt=""><div>Думай медленно… Решай быстро<small>Даниэль Канеман</small></div></div>
      <form class="review-form">
        <fieldset class="review-format-choice" style="border:0;padding:0">
          <label><input type="radio" name="book-format" value="text" ${initialFormat === 'text' ? 'checked' : ''}><span>Текстовая версия</span></label>
          <label><input type="radio" name="book-format" value="audio" ${initialFormat === 'audio' ? 'checked' : ''}><span>Аудиоверсия</span></label>
        </fieldset>
        <div class="review-stars-input" role="group" aria-label="Оценка от 1 до 5">
          ${[1,2,3,4,5].map(n => `<button type="button" data-rating="${n}" aria-label="${n} из 5 звёзд">★</button>`).join('')}
        </div>
        <input type="hidden" name="rating">
        <div class="review-bonus"><span class="review-bonus-icon">л</span><span>Получите 300 бонусов за отзыв с фото и описанием</span></div>
        <label class="review-field-label" for="review-photos">Загрузите до 10 фото</label>
        <div class="review-upload">
          <div class="review-upload-grid" id="review-photo-previews">
            <label class="review-upload-button" for="review-photos" aria-label="Добавить фото">＋</label>
          </div>
          <input id="review-photos" name="photos" type="file" accept="image/*" multiple>
          <p class="review-upload-note">Фотографии останутся на этом устройстве в рамках этой демо-формы.</p>
        </div>
        <label class="review-field-label" for="review-text">Расскажите о книге</label>
        <textarea class="review-textarea" id="review-text" name="review" placeholder="Что понравилось" required></textarea>
        <button class="review-submit" type="submit">Отправить отзыв</button>
        <p class="review-rules">Перед отправкой убедитесь, что отзыв соответствует правилам: без оскорблений и ссылок на сторонние ресурсы.</p>
        <div class="review-feedback" role="status"></div>
      </form>
    </div>`;
  document.body.append(dialog);

  const launcher = document.createElement('button');
  launcher.className = 'review-launcher';
  launcher.type = 'button';
  launcher.textContent = '✎ Оставить отзыв';
  launcher.addEventListener('click', () => dialog.showModal());
  document.body.append(launcher);
  document.querySelectorAll('[data-review-open]').forEach(button => button.addEventListener('click', () => dialog.showModal()));

  const close = () => dialog.close();
  dialog.querySelector('.review-close').addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });

  const ratingField = dialog.querySelector('[name="rating"]');
  const starButtons = [...dialog.querySelectorAll('[data-rating]')];
  starButtons.forEach(button => button.addEventListener('click', () => {
    ratingField.value = button.dataset.rating;
    starButtons.forEach(star => star.classList.toggle('selected', Number(star.dataset.rating) <= Number(ratingField.value)));
  }));

  const fileInput = dialog.querySelector('#review-photos');
  const previewGrid = dialog.querySelector('#review-photo-previews');
  const uploadLabel = previewGrid.querySelector('.review-upload-button');
  let selectedFiles = [];
  fileInput.addEventListener('change', () => {
    selectedFiles = [...selectedFiles, ...[...fileInput.files].slice(0, Math.max(0, 10 - selectedFiles.length))].slice(0, 10);
    fileInput.value = '';
    previewGrid.querySelectorAll('.review-preview').forEach(node => node.remove());
    selectedFiles.forEach((file, index) => {
      const tile = document.createElement('div');
      tile.className = 'review-preview';
      const image = document.createElement('img');
      image.src = URL.createObjectURL(file);
      image.alt = `Фото ${index + 1}`;
      const remove = document.createElement('button');
      remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Удалить фото');
      remove.addEventListener('click', () => { selectedFiles.splice(index, 1); renderPreviews(); });
      tile.append(image, remove); previewGrid.insertBefore(tile, uploadLabel);
    });
    uploadLabel.hidden = selectedFiles.length >= 10;
  });
  function renderPreviews() {
    previewGrid.querySelectorAll('.review-preview').forEach(node => node.remove());
    selectedFiles.forEach((file, index) => {
      const tile = document.createElement('div'); tile.className = 'review-preview';
      const image = document.createElement('img'); image.src = URL.createObjectURL(file); image.alt = `Фото ${index + 1}`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Удалить фото');
      remove.addEventListener('click', () => { selectedFiles.splice(index, 1); renderPreviews(); });
      tile.append(image, remove); previewGrid.insertBefore(tile, uploadLabel);
    });
    uploadLabel.hidden = selectedFiles.length >= 10;
  }

  dialog.querySelector('.review-form').addEventListener('submit', event => {
    event.preventDefault();
    const feedback = dialog.querySelector('.review-feedback');
    if (!ratingField.value) {
      feedback.textContent = 'Выберите оценку от одной до пяти звёзд.';
      feedback.style.display = 'block';
      return;
    }
    feedback.textContent = 'Отзыв заполнен. Публикация требует подключения к сервису отзывов.';
    feedback.style.display = 'block';
  });
})();
