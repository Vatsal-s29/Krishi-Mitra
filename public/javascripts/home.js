// public/javascripts/home.js
AOS.init();

// slider images array

const sliderImgs = [
    "one.jpg",
    "two.jpg",
    "three.jpg",
    "four.jpg",
    "five.jpg",
    "six.jpg",
];
let sliderImage = document.querySelector(".background-image");
let sliderGrids = [...document.querySelectorAll(".grid-item")];

let currentImage = 0;

setInterval(() => {
    changeSliderImage();
}, 6000);

const changeSliderImage = () => {
    sliderGrids.map((gridItem, index) => {
        setTimeout(() => {
            gridItem.classList.remove("hide");

            setTimeout(() => {
                if (index == sliderGrids.length - 1) {
                    if (currentImage >= sliderImgs.length - 1) {
                        currentImage = 0;
                    } else {
                        currentImage++;
                    }

                    sliderImage.src = `img/${sliderImgs[currentImage]}`;

                    sliderGrids.map((item, i) => {
                        setTimeout(() => {
                            item.classList.add("hide");
                        }, i * 100);
                    });
                }
            }, 100);
        }, index * 100);
    });
};

// navbar
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    if (scrollY >= 188) {
        navbar.classList.add("bg");
    } else {
        navbar.classList.remove("bg");
    }
});

// Heading typing effect
const headings = ["Organic Fruits", "Fresh Veggies", "Krishi - Mitra"];
let currentHeading = 0;
const typingDelay = 100; // Delay between each character (in milliseconds)
const erasingDelay = 50; // Delay between erasing each character (in milliseconds)
const newTextDelay = 2000; // Delay before starting a new text (in milliseconds)
const typewriterElement = document.querySelector(".typewriter");

function typeText(text) {
    let charIndex = 0;
    typewriterElement.textContent = ""; // Clear the previous text

    function type() {
        if (charIndex < text.length) {
            typewriterElement.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(type, typingDelay);
        } else {
            setTimeout(eraseText, newTextDelay);
        }
    }

    type();
}

function eraseText() {
    let charIndex = typewriterElement.textContent.length;

    function erase() {
        if (charIndex > 0) {
            typewriterElement.textContent =
                typewriterElement.textContent.substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingDelay);
        } else {
            currentHeading = (currentHeading + 1) % headings.length;
            typeText(headings[currentHeading]);
        }
    }

    erase();
}

// Start the typing effect when the page loads
window.onload = () => {
    typeText(headings[currentHeading]);
};
