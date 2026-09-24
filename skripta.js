document.addEventListener("DOMContentLoaded", function() {
    var hamburgerDugme = document.querySelector(".hamburger");
    var navLista = document.querySelector(".nav-lista");
    if (hamburgerDugme && navLista) {
        hamburgerDugme.addEventListener("click", function() {
            hamburgerDugme.classList.toggle("otvoren");
            navLista.classList.toggle("otvorena");
        });
        document.querySelectorAll(".nav-lista > li").forEach(function(stavka) {
            var podmeni = stavka.querySelector(".padajuci-meni");
            if (podmeni) {
                var link = stavka.querySelector("a");
                link.addEventListener("click", function(dogadjaj) {
                    if (window.innerWidth <= 768) {
                        dogadjaj.preventDefault();
                        stavka.classList.toggle("otvoren-podmeni");
                    }
                });
            }
        });
    }
    var slajder = document.querySelector(".slajder-kontejner");
    if (slajder) {
        var slike = slajder.querySelectorAll(".slajder-slika");
        var indikatorKontejner = slajder.querySelector(".slajder-indikatori");
        var trenutni = 0;
        var vremeAutoplay = 6000;
        var tajmerId = null;
        slike.forEach(function(_, indeks) {
            var tacka = document.createElement("button");
            tacka.setAttribute("aria-label", "Prikaži sliku " + (indeks + 1));
            if (indeks === 0) tacka.classList.add("aktivan");
            tacka.addEventListener("click", function() {
                prikaziSliku(indeks);
                resetujAutoplay();
            });
            indikatorKontejner.appendChild(tacka);
        });
        var tacke = indikatorKontejner.querySelectorAll("button");
        function prikaziSliku(indeks) {
            slike[trenutni].classList.remove("aktivna");
            tacke[trenutni].classList.remove("aktivan");
            trenutni = (indeks + slike.length) % slike.length;
            slike[trenutni].classList.add("aktivna");
            tacke[trenutni].classList.add("aktivan");
        }
        function sledecaSlika() {
            prikaziSliku(trenutni + 1);
        }
        function prethodnaSlika() {
            prikaziSliku(trenutni - 1);
        }
        function pokreniAutoplay() {
            tajmerId = setInterval(sledecaSlika, vremeAutoplay);
        }
        function resetujAutoplay() {
            clearInterval(tajmerId);
            pokreniAutoplay();
        }
        var strelicaDesno = slajder.querySelector(".slajder-strelica.desno");
        var strelicaLevo = slajder.querySelector(".slajder-strelica.levo");
        if (strelicaDesno) strelicaDesno.addEventListener("click", function() {
            sledecaSlika();
            resetujAutoplay();
        });
        if (strelicaLevo) strelicaLevo.addEventListener("click", function() {
            prethodnaSlika();
            resetujAutoplay();
        });
        pokreniAutoplay();
    }
    var telo = document.body;
    var dugmeTema = document.querySelector('[data-akcija="tema"]');
    var dugmeFontVeci = document.querySelector('[data-akcija="font-veci"]');
    var dugmeFontManji = document.querySelector('[data-akcija="font-manji"]');
    function ucitajPodesavanja() {
        var sacuvanaTema = localStorage.getItem("muzej-tema");
        var sacuvaniFont = localStorage.getItem("muzej-font");
        if (sacuvanaTema === "tamna") telo.classList.add("tamna-tema");
        if (sacuvaniFont) telo.classList.add(sacuvaniFont);
    }
    ucitajPodesavanja();
    if (dugmeTema) {
        dugmeTema.addEventListener("click", function() {
            telo.classList.toggle("tamna-tema");
            localStorage.setItem("muzej-tema", telo.classList.contains("tamna-tema") ? "tamna" : "svetla");
        });
    }
    var nivoiFonta = [ "", "font-veci", "font-najveci" ];
    function trenutniNivoFonta() {
        for (var i = 0; i < nivoiFonta.length; i++) {
            if (nivoiFonta[i] && telo.classList.contains(nivoiFonta[i])) return i;
        }
        return 0;
    }
    function postaviFont(nivo) {
        nivoiFonta.forEach(function(klasa) {
            if (klasa) telo.classList.remove(klasa);
        });
        if (nivoiFonta[nivo]) telo.classList.add(nivoiFonta[nivo]);
        localStorage.setItem("muzej-font", nivoiFonta[nivo] || "");
    }
    if (dugmeFontVeci) {
        dugmeFontVeci.addEventListener("click", function() {
            postaviFont(Math.min(trenutniNivoFonta() + 1, nivoiFonta.length - 1));
        });
    }
    if (dugmeFontManji) {
        dugmeFontManji.addEventListener("click", function() {
            postaviFont(Math.max(trenutniNivoFonta() - 1, 0));
        });
    }
    var biracJezika = document.querySelectorAll("[data-jezik-dugme]");
    var sacuvaniJezik = localStorage.getItem("muzej-jezik") || "sr";
    function primeniPrevod(jezik) {
        fetch("js/prevod.json").then(function(odgovor) {
            return odgovor.json();
        }).then(function(recnik) {
            var prevodi = recnik[jezik] || {};
            document.querySelectorAll("[data-prevod]").forEach(function(el) {
                var kljuc = el.getAttribute("data-prevod");
                if (prevodi[kljuc]) el.textContent = prevodi[kljuc];
            });
            document.querySelectorAll("[data-prevod-placeholder]").forEach(function(el) {
                var kljuc = el.getAttribute("data-prevod-placeholder");
                if (prevodi[kljuc]) el.setAttribute("placeholder", prevodi[kljuc]);
            });
            document.documentElement.setAttribute("lang", jezik);
            biracJezika.forEach(function(dugme) {
                dugme.classList.toggle("aktivan", dugme.getAttribute("data-jezik-dugme") === jezik);
            });
        }).catch(function(greska) {
            console.warn("Prevod nije učitan:", greska);
        });
    }
    if (biracJezika.length) {
        primeniPrevod(sacuvaniJezik);
        biracJezika.forEach(function(dugme) {
            dugme.addEventListener("click", function() {
                var jezik = dugme.getAttribute("data-jezik-dugme");
                localStorage.setItem("muzej-jezik", jezik);
                primeniPrevod(jezik);
            });
        });
    }
    var formaKontakt = document.querySelector("#forma-kontakt");
    if (formaKontakt) {
        var poruka = formaKontakt.querySelector(".forma-poruka");
        formaKontakt.addEventListener("submit", function(dogadjaj) {
            dogadjaj.preventDefault();
            var greske = [];
            var ime = formaKontakt.querySelector("#polje-ime");
            var email = formaKontakt.querySelector("#polje-email");
            var tema = formaKontakt.querySelector("#polje-tema");
            var tekst = formaKontakt.querySelector("#polje-poruka");
            var saglasnost = formaKontakt.querySelector("#polje-saglasnost");
            [ ime, email, tema, tekst ].forEach(function(polje) {
                obelezi(polje, false);
            });
            if (!ime.value.trim() || ime.value.trim().length < 2) {
                greske.push("Unesite ispravno ime i prezime (najmanje 2 karaktera).");
                obelezi(ime, true);
            }
            var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(email.value.trim())) {
                greske.push("Unesite ispravnu e-mail adresu.");
                obelezi(email, true);
            }
            if (!tema.value) {
                greske.push("Izaberite temu poruke.");
                obelezi(tema, true);
            }
            if (!tekst.value.trim() || tekst.value.trim().length < 10) {
                greske.push("Poruka mora imati bar 10 karaktera.");
                obelezi(tekst, true);
            }
            if (saglasnost && !saglasnost.checked) {
                greske.push("Potrebna je saglasnost sa politikom privatnosti.");
            }
            if (greske.length) {
                poruka.innerHTML = "<ul>" + greske.map(function(g) {
                    return "<li>" + g + "</li>";
                }).join("") + "</ul>";
                poruka.className = "forma-poruka forma-greska";
            } else {
                poruka.textContent = "Hvala! Vaša poruka je uspešno poslata (demonstraciona forma seminarskog rada).";
                poruka.className = "forma-poruka forma-uspeh";
                formaKontakt.reset();
            }
        });
        function obelezi(polje, greska) {
            if (!polje) return;
            polje.classList.toggle("polje-greska", greska);
        }
    }
    if (window.jQuery) {
        (function($) {
            $(".kartica-marka, .kartica-model").hover(function() {
                $(this).stop(true).animate({
                    marginTop: "-6px"
                }, 150);
            }, function() {
                $(this).stop(true).animate({
                    marginTop: "0px"
                }, 150);
            });
            var $dugmeVrh = $(".dugme-na-vrh");
            $(window).on("scroll", function() {
                if ($(window).scrollTop() > 420) $dugmeVrh.fadeIn(150); else $dugmeVrh.fadeOut(150);
            });
            $dugmeVrh.on("click", function() {
                $("html, body").animate({
                    scrollTop: 0
                }, 500);
            });
            $(".nav-lista > li > a").on("mouseenter", function() {
                $(this).css("letter-spacing", "0.9px");
            }).on("mouseleave", function() {
                $(this).css("letter-spacing", "0.5px");
            });
        })(window.jQuery);
    }
    var animiraniElementi = document.querySelectorAll(".animiraj");
    if ("IntersectionObserver" in window && animiraniElementi.length) {
        var posmatrac = new IntersectionObserver(function(unosi) {
            unosi.forEach(function(unos) {
                if (unos.isIntersecting) {
                    unos.target.classList.add("vidljivo");
                    posmatrac.unobserve(unos.target);
                }
            });
        }, {
            threshold: .15
        });
        animiraniElementi.forEach(function(el) {
            posmatrac.observe(el);
        });
    } else {
        animiraniElementi.forEach(function(el) {
            el.classList.add("vidljivo");
        });
    }
    var trenutnaStranica = window.location.pathname.split("/").pop() || "pocetna.html";
    document.querySelectorAll(".nav-lista a[href]").forEach(function(link) {
        if (link.getAttribute("href") === trenutnaStranica) link.classList.add("aktivan");
    });
});