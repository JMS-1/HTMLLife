$(function () {
    // Jede Zelle erhält die Information, ob sie lebt oder tot ist
    var nameZustand = 'data-zustand';
    var zustandLebt = 'lebt';
    var zustandTot = 'tot';
    var spielfeld = $('#spielfeld');
    var interval = $('#interval');
    var container = spielfeld.find('tbody');
    var zeilen = parseInt(container.attr('data-zeilen'));
    var spalten = parseInt(container.attr('data-spalten'));
    // Wenn eine Zelle angeklickt wird, ändert sie ihren Zustand
    function manual() {
        var zustand = (this.getAttribute(nameZustand) == zustandLebt) ? zustandTot : zustandLebt;
        this.setAttribute(nameZustand, zustand);
    }
    for (var z = 0; z < zeilen; z++) {
        var zeile = $('<tr />').appendTo(container);
        for (var s = 0; s < spalten; s++) {
            var zelle = $('<td />').appendTo(zeile);
            zelle.attr(nameZustand, zustandTot);
            zelle.click(manual);
        }
    }
    var timerOn = false;
    // Hier wird die nächste Generation berechnet
    function schritt() {
        // Zuerst einmal schauen wir uns den IST Zustand an
        var vorher = $.map(container.find('td'), function (zelle, zs) {
            return {
                lebt: (zelle.getAttribute(nameZustand) == zustandLebt),
                zeile: Math.floor(zs / spalten),
                spalte: zs % spalten,
                zelle: zelle,
                nachbarn: 0,
            };
        });
        // Jede lebende Zelle trägt sich bei allen Nachbarn ein
        $.each(vorher, function (zs, zelle) {
            if (!zelle.lebt)
                return;
            for (var z = Math.max(0, zelle.zeile - 1), zm = Math.min(zeilen, zelle.zeile + 2); z < zm; z++)
                for (var s = Math.max(0, zelle.spalte - 1), sm = Math.min(zeilen, zelle.spalte + 2); s < sm; s++)
                    vorher[s + z * spalten].nachbarn += 1;
            // Die einfache Schleife macht jede Zelle zu ihrem eigenen Nachbarn, das müssen wir natürlich rückgängig machen
            zelle.nachbarn -= 1;
        });
        // Und nun nur noch abhängig von der Anzahl der Nachbarn den Zustand der Zelle verändern - oder belassen, wie er ist
        $.each(vorher, function (zs, zelle) {
            if (zelle.nachbarn == 3)
                zelle.zelle.setAttribute(nameZustand, zustandLebt);
            else if (zelle.nachbarn != 2)
                zelle.zelle.setAttribute(nameZustand, zustandTot);
        });
        if (!timerOn)
            return;
        // Auf Wunsch des Anwenders automatisch die nächste Generation berechnen
        var proSekunde = interval.val();
        if (!$.isNumeric(proSekunde))
            proSekunde = 10;
        window.setTimeout(schritt, 1000 / Math.floor(Math.max(1, Math.min(1000, proSekunde))));
    }
    // Das Spielfeld zufällig füllen
    $('#random').click(function () {
        container.find('td').each(function (zs, zelle) {
            var zustand = (Math.random() <= 0.3) ? zustandLebt : zustandTot;
            zelle.setAttribute(nameZustand, zustand);
        });
    });
    // Das Spielfeld löschen
    $('#clear').click(function () {
        container.find('td').each(function (zs, zelle) {
            zelle.setAttribute(nameZustand, zustandTot);
        });
    });
    // Die nächste Generation berechnen
    $('#step').click(schritt);
    // Das ständige Berechnen von Generationen akivieren
    $('#run').click(function () {
        timerOn = !timerOn;
        schritt();
    });
});
//# sourceMappingURL=life.js.map