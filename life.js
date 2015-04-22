window.onload = function () {

    // Jede Zelle erhält die Information, ob sie lebt oder tot ist
    var nameZustand = 'data-zustand';
    var zustandLebt = 'lebt';
    var zustandTot = 'tot';

    // Die wichtigsten visuellen Elemente ermitteln
    var container = document.querySelector('#spielfeld tbody');
    var schritteInfo = document.getElementById('schritte');
    var interval = document.getElementById('interval');

    // Die Größe des Spielfelds auslesen
    var zeilen = parseInt(container.getAttribute('data-zeilen'));
    var spalten = parseInt(container.getAttribute('data-spalten'));

    // Wenn eine Zelle angeklickt wird ändert sie ihren Zustand
    function manual() {
        var zustand = (this.getAttribute(nameZustand) == zustandLebt) ? zustandTot : zustandLebt;

        this.setAttribute(nameZustand, zustand);
    }

    // Tabelle zusammenbauen
    var html = '';

    for (var z = 0; z < zeilen; z++) {
        html += '<tr>';

        for (var s = 0; s < spalten; s++)
            html += '<td />';

        html += '</tr>';
    }

    container.innerHTML = html;

    // Hier merken wir uns alle Zellen
    var alleZellen = container.querySelectorAll('td');

    // Und nun werden die initialisiert
    for (var zs = 0; zs < alleZellen.length; zs++) {
        var zelle = alleZellen[zs];

        zelle.setAttribute(nameZustand, zustandTot);
        zelle.onclick = manual;
    }

    var start = new Date().getTime();
    var timerOn = false;
    var schritte = 0;

    // Anzahl der Schritte anzeigen
    function schritteAnzeigen() {
        var delta = new Date().getTime() - start;
        var proSekunde = (delta > 0) ? Math.round(1000 * schritte / delta) : 0;

        // Anzeigen
        schritteInfo.textContent = proSekunde;

        // Neu aufsetzen
        start = new Date().getTime();
        schritte = 0;

        // Später noch einmal
        window.setTimeout(schritteAnzeigen, 1000);
    }

    // Anzeige erstmalig vornehmen
    schritteAnzeigen();

    // Hier wird die nächste Generation berechnet
    function schritt() {
        schritte = schritte + 1;

        // Zuerst einmal schauen wir uns den IST Zustand an
        var vorher = [];
        for (var zs = 0; zs < alleZellen.length; zs++) {
            var zelle = alleZellen[zs];

            vorher.push({
                lebt: (zelle.getAttribute(nameZustand) == zustandLebt),
                zeile: Math.floor(zs / spalten),
                spalte: zs % spalten,
                zelle: zelle,
                nachbarn: 0,
            });
        };

        // Jede lebende Zelle trägt sich bei allen Nachbarn ein
        for (var zs = 0; zs < vorher.length; zs++) {
            var zelle = vorher[zs];

            if (!zelle.lebt)
                continue;

            for (var z = Math.max(0, zelle.zeile - 1), zm = Math.min(zeilen, zelle.zeile + 2) ; z < zm; z++)
                for (var s = Math.max(0, zelle.spalte - 1), sm = Math.min(zeilen, zelle.spalte + 2) ; s < sm; s++)
                    vorher[s + z * spalten].nachbarn += 1;

            // Die einfache Schleife macht jede Zelle zu ihrem eigenen Nachbarn, das müssen wir natürlich rückgängig machen
            zelle.nachbarn -= 1;
        };

        // Und nun nur noch abhängig von der Anzahl der Nachbarn den Zustand der Zelle verändern - oder belassen, wie er ist
        for (var zs = 0; zs < vorher.length; zs++) {
            var zelle = vorher[zs];

            if (zelle.nachbarn == 3) {
                // Nur ändern wenn nötig
                if (!zelle.lebt)
                    zelle.zelle.setAttribute(nameZustand, zustandLebt);
            }
            else if (zelle.nachbarn != 2) {
                // Nur ändern wenn nötig
                if (zelle.lebt)
                    zelle.zelle.setAttribute(nameZustand, zustandTot);
            }
        };

        if (!timerOn)
            return;

        // Auf Wunsch des Anwenders automatisch die nächste Generation berechnen
        window.setTimeout(schritt, 1000 / Math.max(1, Math.min(1000, interval.value)));
    }

    // Das Spielfeld zufällig füllen
    document.getElementById('random').onclick = function () {
        for (var zs = 0; zs < alleZellen.length; zs++) {
            var zelle = alleZellen[zs];
            var zustand = (Math.random() <= 0.3) ? zustandLebt : zustandTot;

            zelle.setAttribute(nameZustand, zustand);
        };
    };

    // Das Spielfeld löschen
    document.getElementById('clear').onclick = function () {
        for (var zs = 0; zs < alleZellen.length; zs++) {
            alleZellen[zs].setAttribute(nameZustand, zustandTot);
        };
    };

    // Die nächste Generation berechnen
    document.getElementById('step').onclick = schritt;

    // Das ständige Berechnen von Generationen akivieren
    document.getElementById('run').onclick = function () {
        timerOn = !timerOn;
        schritt();
    };

};
