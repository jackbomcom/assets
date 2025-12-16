(function () {

    const MAX_DOTS = 70;        // aynı anda görünen nokta sayısı
    const MIN_SIZE = 2;
    const MAX_SIZE = 5;
    const MIN_SPEED = 6;       // saniye
    const MAX_SPEED = 12;

    function rand(min, max){
    return Math.random() * (max - min) + min;
}

    function createDot(){
    const dot = document.createElement("div");
    dot.className = "snow-dot";

    const size = rand(MIN_SIZE, MAX_SIZE);
    dot.style.width = size + "px";
    dot.style.height = size + "px";
    dot.style.left = rand(0, window.innerWidth) + "px";
    dot.style.opacity = Math.random();
    dot.style.animationDuration = rand(MIN_SPEED, MAX_SPEED) + "s";

    document.body.appendChild(dot);

    dot.addEventListener("animationend", () => {
    dot.remove();
});
}

    setInterval(() => {
    if (document.querySelectorAll(".snow-dot").length < MAX_DOTS) {
    createDot();
}
}, 200);

})();