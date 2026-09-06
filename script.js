// ==========================================
// Плавний скрол по меню
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });
});

// ==========================================
// Анімація появи секцій
// ==========================================

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }

    });

}, {
    threshold: 0.15
});

document.querySelectorAll("section").forEach(section => {
    observer.observe(section);
});

// ==========================================
// Модальне вікно "Детальніше"
// ==========================================

const contactModal = document.getElementById("contactModal");
const openButtons = document.querySelectorAll(".open-contact");
const closeButton = document.querySelector(".contact-close");

if (contactModal && closeButton) {

    openButtons.forEach(button => {

        button.addEventListener("click", () => {
            contactModal.classList.add("active");
            document.body.style.overflow = "hidden";
        });

    });

    closeButton.addEventListener("click", () => {
        contactModal.classList.remove("active");
        document.body.style.overflow = "";
    });

    contactModal.addEventListener("click", (e) => {

        if (e.target === contactModal) {
            contactModal.classList.remove("active");
            document.body.style.overflow = "";
        }

    });

}

// ==========================================
// Кейси — перемикання відео
// ==========================================

const caseTabs = document.querySelectorAll(".case-tab");
const caseVideos = document.querySelectorAll(".case-video");

caseTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        // кнопки
        caseTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        // відео
        caseVideos.forEach(videoBlock => {

            videoBlock.classList.remove("active");

            const video = videoBlock.querySelector("video");

            if (video) {
                video.pause();
                video.currentTime = 0;
            }

        });

        const target = document.getElementById(tab.dataset.case);

        if (target) {

            target.classList.add("active");

            const video = target.querySelector("video");

            if (video) {
                video.play().catch(() => {});
            }

        }

    });

});