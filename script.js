// 高中课程安排优化设计研究 - 主脚本
let currentSlide = 0;
let isAnimating = false;
let slideElements = [];

function initApp() {
    slideElements = document.querySelectorAll('.slide-wrapper');
    const pageNames = ['就绪', '封面', '目录', '研究背景', '文献综述', '研究问题', '研究方法', '结果分析', '结果讨论', '研究结论', '反思与展望', '答辩'];
    const sidebar = document.getElementById('pageSidebar');
    pageNames.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'page-sidebar-item' + (index === 0 ? ' active' : '');
        item.textContent = (index + 1) + '. ' + name;
        item.addEventListener('click', () => jumpToSlide(index));
        sidebar.appendChild(item);
    });
    document.querySelectorAll('.slide').forEach(slide => {
        ['circle-1', 'circle-2', 'rect-1', 'rect-2', 'line-1', 'line-2'].forEach(cls => {
            const el = document.createElement('div');
            el.className = 'geo-deco ' + cls;
            slide.appendChild(el);
        });
    });
    setupEventListeners();
    updateUI();
}

function jumpToSlide(index) {
    resetAnimations();
    document.getElementById('pageSidebar').classList.remove('open');
    goToSlide(index);
}

function resetAnimations() {
    typingStarted = false;
    const textEl = document.getElementById('typing-text');
    const cursorEl = document.getElementById('typing-cursor');
    if (textEl) textEl.textContent = '';
    if (cursorEl) cursorEl.style.display = 'inline-block';
    tocClickCount = 0; tocComplete = false;
    document.querySelectorAll('.toc-item').forEach(item => item.classList.remove('show'));
    bgClickCount = 0; bgComplete = false; bgAnimating = false;
    document.querySelectorAll('.crash-card').forEach(card => card.classList.remove('active', 'crashed', 'crashed-hard'));
    bookPageIndex = 0; bookComplete = false;
    qStep = 0; qComplete = false;
    bubbleStep = 0; bubbleComplete = false;
    scrollStep = 0; scrollComplete = false; scrollAnimating = false;
    wideStep = 0; wideComplete = false; wideAnimating = false;
    defendStep = 0; defendComplete = false;
    discussGroup = 0; discussPhase = 0; discussComplete = false; discussAnimating = false;
    chartGroup = 0; chartComplete = false; chartAnimating = false;
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.fullscreen-btn') || e.target.closest('.page-nav-btn') || e.target.closest('.page-sidebar')) return;
        if (currentSlide === 2 && !tocComplete) { handleTocClick(); return; }
        if (currentSlide === 3 && !bgComplete) { handleBgClick(); return; }
        if (currentSlide === 4 && !bookComplete) { handleBookClick(); return; }
        if (currentSlide === 5 && !qComplete) { handleQuestionClick(); return; }
        if (currentSlide === 6 && !bubbleComplete) { handleBubbleClick(); return; }
        if (currentSlide === 7 && !chartComplete) { handleChartClick(); return; }
        if (currentSlide === 8 && !discussComplete) { handleDiscussClick(); return; }
        if (currentSlide === 9 && !scrollComplete) { handleScrollClick(); return; }
        if (currentSlide === 10 && !wideComplete) { handleWideClick(); return; }
        nextSlide();
    });
    document.addEventListener('wheel', function(e) {
        const sp = e.target.closest('.scroll-paper');
        if (sp && sp.scrollHeight > sp.clientHeight) return;
        e.preventDefault();
        if (e.deltaY > 0) nextSlide(); else prevSlide();
    }, { passive: false });
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': e.preventDefault(); nextSlide(); break;
            case 'ArrowLeft': case 'ArrowUp': case 'PageUp': e.preventDefault(); prevSlide(); break;
        }
    });
}

function goToSlide(index) {
    if (isAnimating || index === currentSlide || index < 0 || index >= slideElements.length) return;
    isAnimating = true;
    slideElements[currentSlide].classList.remove('active');
    currentSlide = index;
    slideElements[currentSlide].classList.add('active');
    updateUI();
    setTimeout(() => { isAnimating = false; }, 500);
}

let bgClickCount = 0, bgComplete = false, bgAnimating = false;
let qStep = 0, qComplete = false;
let defendStep = 0, defendComplete = false;
let wideStep = 0, wideComplete = false, wideAnimating = false;
let scrollStep = 0, scrollComplete = false, scrollAnimating = false;
let bubbleStep = 0, bubbleComplete = false;
let chartGroup = 0, chartComplete = false, chartAnimating = false;
let discussGroup = 0, discussPhase = 0, discussComplete = false, discussAnimating = false;
let currentResultCard = null, currentEvidenceCard = null;
let tocClickCount = 0, tocComplete = false;
let bookPageIndex = 0, bookComplete = false;
let typingStarted = false;

function nextSlide() { if (!isAnimationComplete()) return; if (currentSlide < slideElements.length - 1) goToSlide(currentSlide + 1); }
function prevSlide() { if (!isAnimationComplete()) return; if (currentSlide > 0) goToSlide(currentSlide - 1); }

function isAnimationComplete() {
    if (currentSlide === 2) return tocComplete;
    if (currentSlide === 3) return bgComplete;
    if (currentSlide === 4) return bookComplete;
    if (currentSlide === 5) return qComplete;
    if (currentSlide === 6) return bubbleComplete;
    if (currentSlide === 7) return chartComplete;
    if (currentSlide === 8) return discussComplete;
    if (currentSlide === 9) return scrollComplete;
    if (currentSlide === 10) return wideComplete;
    return true;
}

function updateUI() {
    document.getElementById('progressBar').style.width = ((currentSlide + 1) / slideElements.length * 100) + '%';
    document.querySelectorAll('.page-sidebar-item').forEach((item, index) => item.classList.toggle('active', index === currentSlide));
    if (currentSlide === 1) startTypingEffect();
    if (currentSlide === 4 && !bookComplete) renderBookPage();
}

function handleTocClick() {
    if (currentSlide !== 2 || tocComplete) return;
    tocClickCount++;
    const item = document.getElementById('toc-' + tocClickCount);
    if (item) item.classList.add('show');
    if (tocClickCount >= 6) tocComplete = true;
}

function handleBgClick() {
    if (currentSlide !== 3 || bgComplete || bgAnimating) return;
    bgClickCount++;
    const card = document.getElementById('bg-' + bgClickCount);
    const prevCard = document.getElementById('bg-' + (bgClickCount - 1));
    if (card) {
        bgAnimating = true;
        if (prevCard) { prevCard.classList.remove('active'); prevCard.classList.add('crashed'); }
        setTimeout(() => { card.classList.add('active'); bgAnimating = false; }, 250);
    }
    if (bgClickCount >= 7) bgComplete = true;
}

function handleQuestionClick() {
    if (currentSlide !== 5 || qComplete) return;
    const mainQ = document.getElementById('main-question');
    const subQ = document.getElementById('sub-questions');
    if (qStep === 0) { qStep = 1; mainQ.classList.add('drop'); }
    else if (qStep === 1) { qStep = 2; qComplete = true; mainQ.classList.remove('drop'); mainQ.classList.add('split'); setTimeout(() => subQ.classList.add('show'), 300); }
}

function handleBubbleClick() {
    if (currentSlide !== 6 || bubbleComplete) return;
    const mb = document.getElementById('main-bubble');
    const sb = document.getElementById('small-bubbles');
    const sn = document.getElementById('sticky-notes');
    if (bubbleStep === 0) { bubbleStep = 1; if (mb) mb.classList.add('show'); }
    else if (bubbleStep === 1) { bubbleStep = 2; if (mb) { mb.classList.remove('show'); mb.classList.add('pop'); } setTimeout(() => { if (mb) mb.style.display = 'none'; if (sb) sb.classList.add('show'); }, 500); }
    else if (bubbleStep === 2) { bubbleStep = 3; bubbleComplete = true; if (sb) sb.classList.add('fade-out'); setTimeout(() => { if (sb) sb.classList.remove('show'); if (sn) sn.classList.add('show'); }, 400); }
}

function handleScrollClick() {
    if (currentSlide !== 9 || scrollComplete || scrollAnimating) return;
    const scrolls = document.querySelectorAll('.scroll-wrapper');
    if (scrollStep < scrolls.length) { scrollAnimating = true; scrolls[scrollStep].classList.add('unfolded'); scrollStep++; setTimeout(() => { scrollAnimating = false; }, 800); if (scrollStep >= scrolls.length) scrollComplete = true; }
}

function handleWideClick() {
    if (currentSlide !== 10 || wideComplete || wideAnimating) return;
    const cards = document.querySelectorAll('.wide-card');
    if (wideStep < cards.length - 1) {
        wideAnimating = true;
        cards[wideStep].style.top = '-10%'; cards[wideStep].classList.remove('active'); cards[wideStep].classList.add('pushed');
        wideStep++;
        cards[wideStep].style.top = '28%'; cards[wideStep].classList.add('active');
        setTimeout(() => { wideAnimating = false; }, 700);
    }
    if (wideStep >= cards.length - 1) wideComplete = true;
}

function handleChartClick() {
    if (currentSlide !== 7 || chartComplete || chartAnimating) return;
    chartComplete = true;
}

function handleDiscussClick() {
    if (currentSlide !== 8 || discussComplete || discussAnimating) return;
    discussComplete = true;
}

function startTypingEffect() {
    if (typingStarted) return;
    typingStarted = true;
    const textEl = document.getElementById('typing-text');
    const cursorEl = document.getElementById('typing-cursor');
    if (!textEl || !cursorEl) return;
    const fullText = '深圳中学课程安排现状及优化建议';
    let i = 0;
    function type() {
        if (i < fullText.length) { textEl.textContent += fullText[i]; i++; setTimeout(type, 150); }
        else { cursorEl.style.display = 'none'; }
    }
    setTimeout(type, 500);
}

function renderBookPage() { bookComplete = true; }
function handleBookClick() { if (currentSlide === 4) bookComplete = true; }
