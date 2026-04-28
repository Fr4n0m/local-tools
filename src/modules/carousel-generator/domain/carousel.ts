export type CarouselInput = {
  imageUrls: string[];
  autoplayMs: number;
  showDots: boolean;
};

function safeMs(value: number): number {
  if (!Number.isFinite(value)) return 3000;
  return Math.max(1000, Math.min(15000, Math.floor(value)));
}

export function parseImageLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /^https?:\/\//i.test(line));
}

export function buildCarouselHtml(input: CarouselInput): string {
  const urls = input.imageUrls.slice(0, 12);
  const autoplayMs = safeMs(input.autoplayMs);
  const dots = input.showDots;

  const images = urls
    .map(
      (url, index) =>
        `<img src="${url}" alt="Slide ${index + 1}" class="lt-slide${index === 0 ? " is-active" : ""}" loading="lazy"/>`,
    )
    .join("\n      ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LocalTools Carousel</title>
  <style>
    .lt-carousel{position:relative;max-width:900px;margin:0 auto;border-radius:24px;overflow:hidden;background:#000}
    .lt-slide{display:none;width:100%;aspect-ratio:16/9;object-fit:cover}
    .lt-slide.is-active{display:block}
    .lt-nav{position:absolute;inset:0;display:flex;justify-content:space-between;align-items:center;padding:0 10px;pointer-events:none}
    .lt-btn{pointer-events:auto;border:0;border-radius:999px;background:rgba(0,0,0,.45);color:#fff;width:36px;height:36px;cursor:pointer}
    .lt-dots{position:absolute;left:0;right:0;bottom:10px;display:${dots ? "flex" : "none"};justify-content:center;gap:6px}
    .lt-dot{width:8px;height:8px;border-radius:999px;background:rgba(255,255,255,.45)}
    .lt-dot.is-active{background:#fff}
  </style>
</head>
<body>
  <div class="lt-carousel" data-ms="${autoplayMs}">
    ${images}
    <div class="lt-nav">
      <button class="lt-btn" data-prev aria-label="Previous">‹</button>
      <button class="lt-btn" data-next aria-label="Next">›</button>
    </div>
    <div class="lt-dots"></div>
  </div>
  <script>
    const root = document.querySelector('.lt-carousel');
    const slides = Array.from(root.querySelectorAll('.lt-slide'));
    const dotsRoot = root.querySelector('.lt-dots');
    let index = 0;
    const ms = Number(root.dataset.ms || 3000);
    const drawDots = () => {
      dotsRoot.innerHTML = slides.map((_, i) => '<span class="lt-dot'+(i===index?' is-active':'')+'"></span>').join('');
    };
    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
      drawDots();
    };
    root.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
    root.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
    setInterval(() => show(index + 1), ms);
    drawDots();
  </script>
</body>
</html>`;
}
