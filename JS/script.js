document.addEventListener('DOMContentLoaded', function() {
    // Globale Variablen für alle Operatoren
    let allOperators = [];
    let operatorsLoaded = false;
  
    // Funktion zur Kapitalisierung des ersten Buchstabens
    function capitalizeFirstLetter(string) {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Funktion zur Kapitalisierung aller Operatoren und Definitionen
    function capitalizeAllContent() {
        // Operatoren-Namen und Überschriften kapitalisieren
        document.querySelectorAll('.operator h2 a, .operator-detail h1, .card h2, h1').forEach(element => {
            element.textContent = capitalizeFirstLetter(element.textContent);
        });
        
        // Definitionen kapitalisieren (inkl. Operatordetailseiten)
        document.querySelectorAll('.definition, .Definition, .card p, .operator-detail .definition, .operator-detail .Definition').forEach(element => {
            element.textContent = capitalizeFirstLetter(element.textContent);
        });
        
        // Beispielaufgaben kapitalisieren
        document.querySelectorAll('.example-task').forEach(element => {
            element.textContent = capitalizeFirstLetter(element.textContent);
        });
        
        // Vorgehensweise-Schritte kapitalisieren
        document.querySelectorAll('.example-approach li').forEach(element => {
            element.textContent = capitalizeFirstLetter(element.textContent);
        });
        
        // Überschriften in Beispielabschnitten
        document.querySelectorAll('.example-section h2, .example h3, .example-approach h4').forEach(element => {
            element.textContent = capitalizeFirstLetter(element.textContent);
        });
        
        // Textinhalte in Vorschlägen kapitalisieren
        document.querySelectorAll('.suggestion-item').forEach(element => {
            // Den Textinhalt ohne die Category-Tag-Elemente erhalten
            const textNodes = Array.from(element.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE);
            
            if (textNodes.length > 0) {
                textNodes[0].nodeValue = capitalizeFirstLetter(textNodes[0].nodeValue.trim());
            }
        });
        
        // Zufällige Operatoren auf der Startseite
        document.querySelectorAll('.operator-card h3 a, .operator-card p:not(.category-tag)').forEach(element => {
            element.textContent = capitalizeFirstLetter(element.textContent);
        });
    }

    // Kapitalisierung initial durchführen
    capitalizeAllContent();

    // Bei jeder Änderung an der Seite erneut durchführen
    window.addEventListener('load', capitalizeAllContent);
    window.addEventListener('DOMNodeInserted', function() {
        setTimeout(capitalizeAllContent, 100);
    });

    // Verbesserte Funktion zum Laden aller Operatoren
    async function loadAllOperators() {
      console.log("Lade Operatoren...");
      
      // Wenn bereits geladen, gib die vorhandenen zurück
      if (operatorsLoaded) {
        console.log("Operatoren bereits geladen, verwende Cache");
        return allOperators;
      }
      
      try {
        // Korrekte Pfade verwenden
        const pages = ['AFBs/afb1.html', 'AFBs/afb2.html', 'AFBs/afb3.html'];
        const categoryNames = ['AFB 1', 'AFB 2', 'AFB 3'];
        
        // Leere die Operatoren-Array, falls sie bereits Werte enthält
        allOperators = [];
        
        // Operatoren-Synonyme
        const operatorSynonyms = {
          'nennen': ['benennen', '(be-)nennen'],
          'benennen': ['nennen', '(be-)nennen'],
          '(be-)nennen': ['nennen', 'benennen']
        };
        
        for (let i = 0; i < pages.length; i++) {
          console.log(`Lade Seite: ${pages[i]}`);
          
          const response = await fetch(pages[i]);
          
          if (!response.ok) {
            throw new Error(`HTTP Fehler! Status: ${response.status} bei ${pages[i]}`);
          }
          
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const operators = doc.querySelectorAll('.operator');
          console.log(`${operators.length} Operatoren auf ${pages[i]} gefunden`);
          
          operators.forEach(operator => {
            const name = operator.getAttribute('data-name');
            const definition = operator.querySelector('.definition').textContent.trim();
            
            // Vermeiden von Duplikaten durch Prüfung, ob bereits vorhanden
            const isDuplicate = allOperators.some(op => op.name.toLowerCase() === name.toLowerCase());
            if (!isDuplicate) {
              // URL-Erzeugung korrekt beibehalten
              let detailPageName = name
                .replace(/[/]/g, '')
                .replace(/[\s()]/g, '_')
                .toLowerCase()
                .replace('ä', 'ae')
                .replace('ö', 'oe')
                .replace('ü', 'ue')
                .replace('ß', 'ss') + '.html';
              
              // Spezialfall für nennen/benennen - immer nennen.html verwenden
              const nameLower = name.toLowerCase();
              if (nameLower === 'benennen' || nameLower === '(be-)nennen') {
                detailPageName = 'nennen.html';
              }
              
              const operatorEntry = {
                name: name,
                definition: definition,
                category: categoryNames[i],
                url: `AFBs/Beispielaufgaben Operatoren/${detailPageName}`,
                alternativeNames: operatorSynonyms[nameLower] || []
              };
              
              allOperators.push(operatorEntry);
            }
          });
        }
        
        // Virtuelle Einträge für Synonyme erstellen
        const virtualEntries = [];
        
        allOperators.forEach(operator => {
          const nameLower = operator.name.toLowerCase();
          
          // Für nennen/benennen spezielle virtuelle Einträge erstellen
          if (nameLower === 'nennen') {
            // Erstelle virtuelle Einträge für benennen und (be-)nennen, wenn sie nicht vorhanden sind
            const bennenExists = allOperators.some(op => op.name.toLowerCase() === 'benennen');
            const beNennenExists = allOperators.some(op => op.name.toLowerCase() === '(be-)nennen');
            
            if (!bennenExists) {
              virtualEntries.push({
                name: 'Benennen',
                definition: operator.definition,
                category: operator.category,
                url: operator.url,
                isVirtual: true
              });
            }
            
            if (!beNennenExists) {
              virtualEntries.push({
                name: '(Be-)nennen',
                definition: operator.definition,
                category: operator.category,
                url: operator.url,
                isVirtual: true
              });
            }
          }
        });
        
        // Virtuelle Einträge hinzufügen
        allOperators = [...allOperators, ...virtualEntries];
        
        console.log(`Insgesamt ${allOperators.length} Operatoren geladen (inkl. virtuelle Einträge)`);
        operatorsLoaded = true;
        return allOperators;
      } catch (error) {
        console.error('Fehler beim Laden der Operatoren:', error);
        // Detaillierten Fehler anzeigen
        alert(`Fehler beim Laden der Operatoren: ${error.message}`);
        return [];
      }
    }
  
    // Suchfunktion für die Startseite
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    // Debugging-Info
    console.log("Suchfelder:", { 
      searchInput: searchInput ? "gefunden" : "nicht gefunden", 
      searchButton: searchButton ? "gefunden" : "nicht gefunden",
      searchResults: searchResults ? "gefunden" : "nicht gefunden",
      searchSuggestions: searchSuggestions ? "gefunden" : "nicht gefunden" 
    });
    
    if (searchInput && searchSuggestions) {
      // Verbesserte Positionierung der Vorschläge für mobile Geräte
      function updateSuggestionPosition() {
        const isMobile = window.innerWidth <= 768;
        const inputRect = searchInput.getBoundingClientRect();
        searchSuggestions.style.position = isMobile ? 'fixed' : 'absolute';
        
        if (isMobile) {
          // Mobile Positionierung
          searchSuggestions.style.width = 'calc(100% - 1rem)';
          searchSuggestions.style.left = '0.5rem';
          searchSuggestions.style.right = '0.5rem';
          // Position vom Boden des Eingabefelds
          searchSuggestions.style.top = `${inputRect.bottom + window.scrollY}px`;
        } else {
          // Desktop Positionierung (bestehender Code)
          searchSuggestions.style.width = `${inputRect.width}px`;
          searchSuggestions.style.top = `${inputRect.height}px`;
          searchSuggestions.style.left = '0';
        }
        searchSuggestions.style.zIndex = '1000';
      }
      
      // Vorschlagsliste mit Schließen-Button anzeigen
      function showSuggestions(html, isMobile) {
        if (isMobile) {
          html = `<div class="suggestion-close">Schließen</div>` + html;
        }
        
        searchSuggestions.innerHTML = html;
        searchSuggestions.classList.add('active');
        searchSuggestions.style.display = 'block';
        
        // Event-Listener für den Schließen-Button
        const closeButton = searchSuggestions.querySelector('.suggestion-close');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            searchSuggestions.classList.remove('active');
            searchSuggestions.style.display = 'none';
          });
        }
        
        // Positionierung aktualisieren
        updateSuggestionPosition();
      }
      
      // Den gesamten .search-box als Container verwenden, anstatt einen neuen zu erstellen
      const searchBox = searchInput.closest('.search-box');
      if (searchBox) {
        // Das bestehende .search-box als Container verwenden
        searchBox.style.position = 'relative';
        searchBox.appendChild(searchSuggestions);
      } else {
        // Fallback: Suchleiste in Container einpacken wie vorher
        const searchContainer = document.createElement('div');
        searchContainer.style.position = 'relative';
        searchContainer.style.width = '100%';
        searchContainer.style.display = 'flex'; // Flex-Container für Input und Button
        searchInput.parentNode.insertBefore(searchContainer, searchInput);
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchSuggestions);
      }
      
      // Nur einmal Event-Listener für Klicks auf Vorschläge hinzufügen
      searchSuggestions.addEventListener('click', function(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
          const url = item.getAttribute('data-url');
          console.log(`Navigiere zu: ${url}`);
          window.location.href = url;
        }
      });
      
      // Live-Suche während des Tippens
      searchInput.addEventListener('input', async function() {
        const query = this.value.toLowerCase().trim();
        console.log(`Suchanfrage: "${query}"`);
        
        // Aktualisiere die Position bei jeder Eingabe
        updateSuggestionPosition();
        
        if (query.length < 1) {
          searchSuggestions.classList.remove('active');
          searchSuggestions.style.display = 'none';
          return;
        }
        
        try {
          const operators = await loadAllOperators();
          console.log(`Suche in ${operators.length} Operatoren`);
          
          // Ergebnisse mit Relevanz berechnen
          const results = operators.map(op => {
            const name = op.name.toLowerCase();
            let score = 0;
            
            // Scoring-Logik beibehalten
            if (name === query) {
              score += 100;
            } else if (name.startsWith(query)) {
              score += 75;
            } else if (name.includes(query)) {
              score += 50;
            } else if (op.definition.toLowerCase().includes(query)) {
              score += 30;
            } else {
              for (const char of query) {
                if (name.includes(char)) {
                  score += 5;
                }
              }
            }
            
            // Spezialfall nennen/benennen
            if ((query === 'nennen' || query === 'benennen' || query === '(be-)nennen') && 
                (name === 'nennen' || name === 'benennen' || name === '(be-)nennen')) {
              score += 90; // Hohe Relevanz für alle Varianten
            }
            
            return { operator: op, score };
          })
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
          
          console.log(`${results.length} Ergebnisse gefunden`);
          
          // Duplikate für nennen/benennen entfernen
          const uniqueResults = [];
          const seenUrls = new Set();
          
          results.forEach(result => {
            if (!seenUrls.has(result.operator.url)) {
              uniqueResults.push(result);
              seenUrls.add(result.operator.url);
            }
          });
          
          if (uniqueResults.length > 0) {
            let html = '';
            
            uniqueResults.forEach(result => {
              html += `<div class="suggestion-item" data-url="${result.operator.url}">${result.operator.name} <span class="category-tag">${result.operator.category}</span></div>`;
            });
            
            showSuggestions(html, window.innerWidth <= 768);
            
            // Kapitalisierung auf die neu erstellten Elemente anwenden
            setTimeout(capitalizeAllContent, 10);
          } else {
            searchSuggestions.classList.remove('active');
            searchSuggestions.style.display = 'none';
          }
        } catch (error) {
          console.error("Fehler bei der Live-Suche:", error);
          searchSuggestions.innerHTML = `<div class="suggestion-item error">Fehler bei der Suche</div>`;
          searchSuggestions.classList.add('active');
          searchSuggestions.style.display = 'block';
        }
      });
      
      // Initial Position setzen
      window.addEventListener('load', updateSuggestionPosition);
      window.addEventListener('resize', updateSuggestionPosition);
      
      // Schließen der Dropdown-Liste bei Klick außerhalb
      document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
          searchSuggestions.classList.remove('active');
          searchSuggestions.style.display = 'none';
        }
      });
      
      // Ursprüngliche Suchfunktion bei Klick auf Button
      if (searchButton) {
        searchButton.addEventListener('click', performSearch);
      }
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch();
          searchSuggestions.classList.remove('active');
          searchSuggestions.style.display = 'none';
        }
      });
    } else {
      console.error("Suchfelder konnten nicht gefunden werden!");
    }
    
    // Suchfunktion für die Unterseiten
    const pageSearchInput = document.getElementById('pageSearchInput');
    const pageSearchButton = document.getElementById('pageSearchButton');
    const pageSuggestions = document.getElementById('pageSuggestions');
    
    if (pageSearchInput && pageSearchButton && pageSuggestions) {
      // Verbesserte Positionierung der Vorschläge für mobile Geräte
      function updatePageSuggestionPosition() {
        const isMobile = window.innerWidth <= 768;
        const inputRect = pageSearchInput.getBoundingClientRect();
        pageSuggestions.style.position = isMobile ? 'fixed' : 'absolute';
        
        if (isMobile) {
          // Mobile Positionierung
          pageSuggestions.style.width = 'calc(100% - 1rem)';
          pageSuggestions.style.left = '0.5rem';
          pageSuggestions.style.right = '0.5rem';
          pageSuggestions.style.top = `${inputRect.bottom + window.scrollY}px`;
        } else {
          // Desktop Positionierung
          pageSuggestions.style.width = `${inputRect.width}px`;
          pageSuggestions.style.top = `${inputRect.height}px`;
          pageSuggestions.style.left = '0';
        }
        pageSuggestions.style.zIndex = '1000';
      }
      
      // Den gesamten .search-box als Container verwenden, anstatt einen neuen zu erstellen
      const pageSearchBox = pageSearchInput.closest('.search-box');
      if (pageSearchBox) {
        // Das bestehende .search-box als Container verwenden
        pageSearchBox.style.position = 'relative';
        pageSearchBox.appendChild(pageSuggestions);
      } else {
        // Fallback: Suchleiste in Container einpacken wie vorher
        const pageSearchContainer = document.createElement('div');
        pageSearchContainer.style.position = 'relative';
        pageSearchContainer.style.width = '100%';
        pageSearchContainer.style.display = 'flex'; // Flex-Container für Input und Button
        pageSearchInput.parentNode.insertBefore(pageSearchContainer, pageSearchInput);
        pageSearchContainer.appendChild(pageSearchInput);
        pageSearchContainer.appendChild(pageSuggestions);
      }
      
      // Nur einmal Event-Listener für Klicks auf Vorschläge hinzufügen
      pageSuggestions.addEventListener('click', function(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
          const id = item.getAttribute('data-id');
          const element = document.getElementById(id);
          if (element) {
            // Alle anzeigen und das gewählte hervorheben
            document.querySelectorAll('.operator').forEach(op => {
              op.classList.remove('hidden');
              op.classList.remove('highlight');
            });
            
            element.classList.add('highlight');
            element.scrollIntoView({ behavior: 'smooth' });
            
            pageSearchInput.value = item.textContent;
            pageSuggestions.classList.remove('active');
            pageSuggestions.style.display = 'none';
          }
        }
      });
      
      // Seitenspezifische Live-Suche für Vorschläge
      pageSearchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        // Aktualisiere die Position bei jeder Eingabe
        updatePageSuggestionPosition();
        
        if (query.length < 1) {
          pageSuggestions.classList.remove('active');
          pageSuggestions.style.display = 'none';
          
          // Zurücksetzen der Operatoren-Anzeige
          document.querySelectorAll('.operator').forEach(op => {
            op.classList.remove('hidden');
          });
          
          const noResultsElement = document.querySelector('.no-results');
          if (noResultsElement) {
            noResultsElement.remove();
          }
          return;
        }
        
        // Sammeln von Vorschlägen aus vorhandenen Operatoren auf der Seite
        const operators = document.querySelectorAll('.operator');
        const matches = [];
        
        operators.forEach(op => {
          const name = op.getAttribute('data-name');
          const definition = op.querySelector('.definition').textContent;
          
          if (name.toLowerCase().includes(query) || definition.toLowerCase().includes(query)) {
            matches.push({ name, id: op.id });
          }
        });
        
        if (matches.length > 0) {
          let html = '';
          
          matches.slice(0, 5).forEach(match => {
            html += `<div class="suggestion-item" data-id="${match.id}">${match.name}</div>`;
          });
          
          pageSuggestions.innerHTML = html;
          pageSuggestions.classList.add('active');
          pageSuggestions.style.display = 'block';
          
          // Positionierung noch einmal aktualisieren nach Befüllung
          updatePageSuggestionPosition();
        } else {
          pageSuggestions.classList.remove('active');
          pageSuggestions.style.display = 'none';
        }
      });
      
      // Initial Position setzen
      window.addEventListener('load', updatePageSuggestionPosition);
      window.addEventListener('resize', updatePageSuggestionPosition);
      
      pageSearchButton.addEventListener('click', performPageSearch);
      pageSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performPageSearch();
          pageSuggestions.classList.remove('active');
          pageSuggestions.style.display = 'none';
        }
      });
    }
    
    // Anker-IDs zu Operatoren hinzufügen (für tiefe Links)
    document.querySelectorAll('.operator').forEach(op => {
      const name = op.getAttribute('data-name');
      if (name) {
        const id = name.replace(/[/\s()]/g, '_');
        op.id = id;
      }
    });
  
    // Aktuelle Seite in der Navigation hervorheben
    highlightCurrentPage();
  
    // Breadcrumbs auf Detailseiten
    createBreadcrumbs();
  
    // Zufällige Operatoren auf der Startseite anzeigen
    const originalShowRandomOperators = showRandomOperators;
    showRandomOperators = function() {
        originalShowRandomOperators();
        setTimeout(capitalizeAllContent, 500);
    };
    showRandomOperators();
  
    // Last-Update Info anzeigen
    showLastUpdate();
    
    // Kapitalisierung nach dem Laden der Seite durchführen
    capitalizeAllContent();
    
    // Auch nach dynamischem Laden von Inhalten (Suche, zufällige Operatoren)
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            setTimeout(capitalizeAllContent, 100);
        });
    }
    
    if (pageSearchInput) {
        pageSearchInput.addEventListener('input', function() {
            setTimeout(capitalizeAllContent, 100);
        });
    }
    
    // Ursprüngliche Funktion zum Suchen anpassen
    const originalPerformSearch = performSearch;
    performSearch = function() {
        originalPerformSearch();
        setTimeout(capitalizeAllContent, 500);
    };
    
    // Ursprüngliche Funktion zum Seiten-Suchen anpassen
    const originalPerformPageSearch = performPageSearch;
    performPageSearch = function() {
        originalPerformPageSearch();
        setTimeout(capitalizeAllContent, 500);
    };
  });
  
  // Aktuelle Seite in der Navigation hervorheben
  function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    // AFB-Seiten
    if (filename.startsWith('afb')) {
      const navLink = document.querySelector(`nav a[href="${filename}"]`);
      if (navLink) navLink.classList.add('active');
    } 
    // Startseite
    else if (filename === '' || filename === 'index.html') {
      const navLink = document.querySelector('nav a[href="index.html"]');
      if (navLink) navLink.classList.add('active');
    } 
    // Detailseiten - AFB zuordnen
    else {
      // Hole Operatornamen aus HTML oder versuche, vom Dateinamen abzuleiten
      const operatorHeading = document.querySelector('.operator-detail h1');
      if (operatorHeading) {
        const operatorName = operatorHeading.textContent.trim();
        
        // AFB-Zuordnung basierend auf dem Operator
        const afb1Operators = ['(be-)nennen', 'berechnen', 'beschreiben', 'skizzieren', 'wiedergeben', 'zusammenfassen'];
        const afb3Operators = ['beurteilen', 'bewerten', 'diskutieren', 'entwickeln', 'erörtern', 'gestalten', 'interpretieren', 'überprüfen'];
        
        if (afb1Operators.some(op => operatorName.includes(op))) {
          const navLink = document.querySelector('nav a[href="../afb1.html"]');
          if (navLink) navLink.classList.add('active');
        } else if (afb3Operators.some(op => operatorName.includes(op))) {
          const navLink = document.querySelector('nav a[href="../afb3.html"]');
          if (navLink) navLink.classList.add('active');
        } else {
          const navLink = document.querySelector('nav a[href="../afb2.html"]');
          if (navLink) navLink.classList.add('active');
        }
      }
    }
  }
  
  // Breadcrumbs für Detailseiten erstellen
  function createBreadcrumbs() {
    const operatorDetail = document.querySelector('.operator-detail');
    if (!operatorDetail) return;
    
    const operatorHeading = document.querySelector('.operator-detail h1');
    if (!operatorHeading) return;
    
    const operatorName = operatorHeading.textContent.trim();
    
    // AFB-Kategorie bestimmen
    const afb1Operators = ['(be-)nennen', 'berechnen', 'beschreiben', 'skizzieren', 'wiedergeben', 'zusammenfassen'];
    const afb3Operators = ['beurteilen', 'bewerten', 'diskutieren', 'entwickeln', 'erörtern', 'gestalten', 'interpretieren', 'überprüfen'];
    
    let afbPage, afbName;
    if (afb1Operators.some(op => operatorName.includes(op))) {
      afbPage = '../afb1.html';
      afbName = 'AFB 1';
    } else if (afb3Operators.some(op => operatorName.includes(op))) {
      afbPage = '../afb3.html';
      afbName = 'AFB 3';
    } else {
      afbPage = '../afb2.html';
      afbName = 'AFB 2';
    }
    
    // Breadcrumbs-Element erstellen
    const breadcrumbs = document.createElement('div');
    breadcrumbs.className = 'breadcrumbs';
    breadcrumbs.innerHTML = `
      <a href="../../index.html">Startseite</a> &gt; 
      <a href="${afbPage}">${afbName}</a> &gt; 
      <span>${operatorName}</span>
    `;
    
    // Breadcrumbs einfügen
    operatorDetail.insertBefore(breadcrumbs, operatorDetail.firstChild);
  }
  
  // Zufällige Operatoren auf der Startseite anzeigen
  function showRandomOperators() {
    const randomOperatorsSection = document.getElementById('randomOperators');
    if (!randomOperatorsSection) return;
    
    // loadAllOperators ist im DOMContentLoaded-Scope definiert, als eigenständige Funktion hier neu definieren
    async function loadRandomOperators() {
      try {
        const pages = ['AFBs/afb1.html', 'AFBs/afb2.html', 'AFBs/afb3.html'];
        const categoryNames = ['AFB 1', 'AFB 2', 'AFB 3'];
        const operators = [];
        
        for (let i = 0; i < pages.length; i++) {
          const response = await fetch(pages[i]);
          
          if (!response.ok) {
            throw new Error(`HTTP Fehler! Status: ${response.status} bei ${pages[i]}`);
          }
          
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const pageOperators = doc.querySelectorAll('.operator');
          
          pageOperators.forEach(operator => {
            const name = operator.getAttribute('data-name');
            const definition = operator.querySelector('.definition').textContent.trim();
            
            const detailPageName = name
              .replace(/[/]/g, '')
              .replace(/[\s()]/g, '_')
              .toLowerCase()
              .replace('ä', 'ae')
              .replace('ö', 'oe')
              .replace('ü', 'ue')
              .replace('ß', 'ss') + '.html';
            
            operators.push({
              name: name,
              definition: definition,
              category: categoryNames[i],
              url: `AFBs/Beispielaufgaben Operatoren/${detailPageName}`
            });
          });
        }
        
        return operators;
      } catch (error) {
        console.error('Fehler beim Laden der zufälligen Operatoren:', error);
        return [];
      }
    }
    
    loadRandomOperators().then(operators => {
      if (operators.length === 0) {
        randomOperatorsSection.innerHTML = '<p>Keine Operatoren verfügbar.</p>';
        return;
      }
      
      // Zufällige Operatoren auswählen
      const shuffled = [...operators].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      let html = '<h2>Zufällige Operatoren</h2><div class="random-operators-grid">';
      selected.forEach(op => {
        html += `
          <div class="operator-card">
            <h3><a href="${op.url}">${op.name}</a></h3>
            <p class="category-tag">${op.category}</p>
            <p>${op.definition.substring(0, 100)}${op.definition.length > 100 ? '...' : ''}</p>
            <a href="${op.url}" class="button">Details anzeigen</a>
          </div>
        `;
      });
      html += '</div>';
      
      randomOperatorsSection.innerHTML = html;
    }).catch(error => {
      console.error('Fehler beim Anzeigen der zufälligen Operatoren:', error);
      randomOperatorsSection.innerHTML = '<p>Fehler beim Laden der Operatoren.</p>';
    });
  }
  
  // Last-Update-Info anzeigen
  function showLastUpdate() {
    const footerElement = document.querySelector('footer');
    if (!footerElement) return;
    
    const dateString = '2025-05-08';
    footerElement.innerHTML = `
      <p>&copy; 2025 Operatoren-Wiki | Erstellt von Lennart Kassal | Zuletzt aktualisiert: ${dateString}</p>
    `;
  }