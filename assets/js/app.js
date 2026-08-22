const slides = document.querySelectorAll(".slide");

let current = 0;

setInterval(() => {

    // 今の写真を左へ出す
    slides[current].classList.remove("active");
    slides[current].classList.add("prev");

    current++;

    // 最後まで行ったら最初へ
    if (current >= slides.length) {
        current = 0;
    }

    // 次の写真を右から入れる
    slides[current].classList.add("active");

    // 前のクラスを少し後に消す
    setTimeout(() => {
        slides.forEach(slide => {
            slide.classList.remove("prev");
        });
    }, 800);

}, 3000);