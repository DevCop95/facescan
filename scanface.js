// == FB Sentinel Pro - By DevYHB ==
(async function() {
    if (window.fbuMasterRunning) {
        document.getElementById('fbu-app-root')?.remove();
        window.fbuMasterRunning = false;
        return;
    }
    window.fbuMasterRunning = true;

    const SAFE_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzNzQxNTEiLz48cGF0aCBkPSJNMjAgMjFjLTMuMyAwLTYtMi43LTYtNnMyLjctNiA2LTYgNiAyLjcgNiA2LTIuNyA2LTYgNnptMCAyYy00LjUgMC0xMy41IDIuMy0xMy41IDYuOHYxLjJoMjd2LTEuMmMwLTQuNS05LTYuOC0xMy41LTYuOHoiIGZpbGw9IiM5Y2EzYWYiLz48L3N2Zz4=";

    const loadDB = () => {
        try {
            let data = JSON.parse(localStorage.getItem('fb_friends_db') || '[]');
            const blackListExact = ['añadir a historia', 'fotos', 'reels', 'información', 'amigos', 'amigos en común', 'buscar', 'más'];
            return data.filter(f => {
                let n = (f.fullname || '').toLowerCase().trim();
                if (blackListExact.includes(n)) return false;
                if (n.includes('amigo')) return false;
                // Excluir específicamente "Añadir a historia" y variaciones
                if (n.includes('historia') || n.includes('story')) return false; 
                if (f.id.includes('friends') || f.id.includes('about') || f.id.includes('photos') || f.id.includes('reels') || f.id.includes('storiescreate')) return false;
                return true;
            });
        } catch { return []; }
    };
    
    const saveDB = (data) => {
        localStorage.setItem('fb_friends_db', JSON.stringify(data));
    };

    const S = {
        friends_old: loadDB(),
        friends_current: [],
        unfriends: [],
        tab: 'all', 
        searchQuery: '',
        isScanning: false
    };

    const rootDiv = document.createElement('div');
    rootDiv.id = 'fbu-app-root';
    Object.assign(rootDiv.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        zIndex: '2147483647', backgroundColor: '#0d1117', color: '#e5e7eb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', flexDirection: 'column'
    });

    const style = document.createElement('style');
    style.textContent = `
        .fbu-nav { display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 20px; background-color:#111827; border-bottom:1px solid #1f2937; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); flex-shrink:0;}
        .fbu-nav-title { font-size:1.2rem; font-weight:700; background:linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .fbu-close-btn { background:none; border:none; color:#ef4444; font-size:1.5rem; cursor:pointer; padding:5px; transition:transform 0.2s;}
        .fbu-close-btn:hover { transform:scale(1.1); }
        .fbu-layout { display:flex; flex:1; overflow:hidden; }
        .fbu-sidebar { width:260px; background-color:#111827; border-right:1px solid #1f2937; display:flex; flex-direction:column; padding:20px; box-sizing:border-box;}
        .fbu-main { flex:1; overflow-y:auto; padding:20px; background-color:#0d1117; position:relative; box-sizing:border-box;}
        
        .fbu-stat-box { background-color:#1f2937; padding:15px; border-radius:12px; margin-bottom:15px; border:1px solid #374151;}
        .fbu-stat-label { font-size:0.75rem; color:#9ca3af; text-transform:uppercase; font-weight:600; letter-spacing:0.05em; margin-bottom:5px;}
        .fbu-stat-value { font-size:1.8rem; font-weight:800; color:#f3f4f6;}
        
        .fbu-tabs { display:flex; flex-direction:column; gap:8px; margin-top:20px;}
        .fbu-tab-btn { background:none; border:none; text-align:left; padding:10px 15px; border-radius:8px; color:#9ca3af; font-weight:500; cursor:pointer; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center;}
        .fbu-tab-btn:hover { background-color:#1f2937; color:#f3f4f6;}
        .fbu-tab-active { background-color:#3b82f6; color:#ffffff !important; box-shadow:0 4px 12px rgba(59,130,246,0.3);}
        .fbu-badge { background-color:rgba(0,0,0,0.2); padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:700;}
        
        .fbu-search-box { width:100%; padding:12px 15px; border-radius:8px; border:1px solid #374151; background-color:#1f2937; color:#f3f4f6; margin-bottom:20px; font-size:0.95rem; outline:none; box-sizing:border-box;}
        .fbu-search-box:focus { border-color:#3b82f6; }
        
        .fbu-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:15px; padding-bottom:50px;}
        .fbu-card { background-color:#1f2937; border:1px solid #374151; border-radius:12px; padding:15px; display:flex; align-items:center; gap:15px; transition:transform 0.2s; cursor:pointer; text-decoration:none; color:inherit;}
        .fbu-card:hover { transform:translateY(-2px); border-color:#4b5563; background-color:#273242;}
        .fbu-card-img { width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid #374151; background-color:#111827;}
        .fbu-card-info { display:flex; flex-direction:column; overflow:hidden; flex:1;}
        .fbu-card-name { font-weight:600; font-size:0.95rem; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;}
        .fbu-card-id { font-size:0.75rem; color:#9ca3af; margin-top:4px;}
        .fbu-card-mutual { display:flex; align-items:center; gap:4px; font-size:0.75rem; color:#f59e0b; margin-top:2px; font-weight:500;}
        .fbu-status-red { background-color:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2);}
        .fbu-status-red .fbu-card-mutual { color:#f87171; }
        
        .fbu-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:60%; color:#6b7280; }
        .fbu-empty span { font-size:3rem; margin-bottom:15px;}
        
        .fbu-scan-btn { background-color:#8b5cf6; color:white; border:none; padding:12px; border-radius:8px; font-weight:700; cursor:pointer; margin-top:auto; transition:background 0.2s; font-size:1rem; box-shadow:0 4px 12px rgba(139,92,246,0.3);}
        .fbu-scan-btn:hover { background-color:#7c3aed;}
        .fbu-scan-btn:disabled { opacity:0.5; cursor:not-allowed;}
        
        .fbu-overlay { position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(13,17,23,0.8); backdrop-filter:blur(4px); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:100;}
        .fbu-spinner { width:50px; height:50px; border:4px solid rgba(59,130,246,0.3); border-top-color:#3b82f6; border-radius:50%; animation:fbu-spin 1s linear infinite; margin-bottom:20px;}
        @keyframes fbu-spin { to {transform:rotate(360deg);} }
    `;
    
    document.documentElement.appendChild(rootDiv);
    rootDiv.appendChild(style);

    const runScanner = async () => {
        if (!location.href.includes('friends')) {
            alert('Para escanear, primero cierra esta UI, ve a la pestaña "Amigos" de tu perfil en Facebook y vuelve a iniciar el script.');
            return;
        }

        S.isScanning = true;
        render();

        S.friends_current = [];
        let seenIds = new Set();
        let retries = 0;
        
        const PROFILE_SELECTOR = 'a[href*="facebook.com/"][tabindex="0"]'; 
        window.scrollTo(0, 0);

        while (window.fbuMasterRunning && S.isScanning) {
            let links = document.querySelectorAll(PROFILE_SELECTOR);
            let lastLink = null;

            links.forEach(a => {
                let name = a.innerText.trim();
                let lowerName = name.toLowerCase();
                
                if (!name || name === '' || lowerName.includes("amigo") || lowerName === 'más opciones' || lowerName.includes('historia')) return;
                
                let isMain = a.closest('div[role="main"]');
                if(!isMain) return;

                let url = new URL(a.href);
                let id = url.pathname.replace(/\//g, '');
                if (id === 'profile.php') id = url.searchParams.get('id');

                if (id && !seenIds.has(id) && id !== 'me' && !id.includes('friends') && !id.includes('about') && !id.includes('storiescreate')) {
                    seenIds.add(id);

                    let imgNode = document.querySelector(`a[href*="${id}"] image, a[href*="${id}"] img`);
                    let realPic = imgNode ? (imgNode.getAttribute('xlink:href') || imgNode.src) : SAFE_AVATAR;
                    if(realPic.startsWith('data:')) realPic = SAFE_AVATAR; 

                    let mutuals = "";
                    let container = a;
                    for(let i=0; i<4; i++) { if(container.parentElement) container = container.parentElement; }
                    
                    let cardText = container.innerText || "";
                    let mutualMatch = cardText.match(/(\d+)\s+amig[o|a]s?\s+en\s+com[uú]n/i);
                    if (mutualMatch) mutuals = mutualMatch[0]; 

                    S.friends_current.push({ 
                        id: id, 
                        fullname: name, 
                        profile_pic_url: realPic,
                        mutuals: mutuals
                    });
                    lastLink = a;
                }
            });

            const counterEl = document.getElementById('fbu-scan-count');
            if(counterEl) counterEl.innerText = S.friends_current.length;

            if (lastLink) lastLink.scrollIntoView({ behavior: 'auto', block: 'center' });
            window.scrollBy(0, 400); 

            await new Promise(r => setTimeout(r, 1200));

            if (lastLink === null) {
                retries++;
                if (retries > 5) break; 
            } else {
                retries = 0;
            }
        }

        if (S.friends_old.length > 0) {
            const currentMap = new Map(S.friends_current.map(u => [u.id, u]));
            S.unfriends = S.friends_old.filter(oldU => !currentMap.has(oldU.id));
        }

        saveDB(S.friends_current);
        S.friends_old = S.friends_current; 
        S.isScanning = false;
        S.tab = S.unfriends.length > 0 ? 'unfriends' : 'all';
        render();
        alert(`Escaneo completado. Base de datos actualizada con fotos reales y amigos en común.`);
    };

    const render = () => {
        let displayList = [];
        if (S.tab === 'all') displayList = S.friends_old;
        else if (S.tab === 'unfriends') displayList = S.unfriends;
        
        if (S.searchQuery) {
            displayList = S.friends_old.filter(f => (f.fullname || '').toLowerCase().includes(S.searchQuery.toLowerCase()));
            S.tab = 'search';
        }

        const contentHtml = `
            <div class="fbu-nav">
                <div class="fbu-nav-title">🕵️‍♂️ FB Sentinel Pro</div>
                <button class="fbu-close-btn" data-action="close">✖</button>
            </div>
            <div class="fbu-layout">
                <div class="fbu-sidebar">
                    <div class="fbu-stat-box">
                        <div class="fbu-stat-label">Total en Base de Datos</div>
                        <div class="fbu-stat-value">${S.friends_old.length}</div>
                    </div>
                    <div class="fbu-stat-box" style="border-color:rgba(239,68,68,0.3); background-color:rgba(239,68,68,0.05);">
                        <div class="fbu-stat-label" style="color:#ef4444;">Te eliminaron</div>
                        <div class="fbu-stat-value" style="color:#ef4444;">${S.unfriends.length}</div>
                    </div>
                    
                    <div class="fbu-tabs">
                        <button class="fbu-tab-btn ${S.tab==='all' && !S.searchQuery?'fbu-tab-active':''}" data-tab="all">
                            👥 Lista Actual <span class="fbu-badge">${S.friends_old.length}</span>
                        </button>
                        <button class="fbu-tab-btn ${S.tab==='unfriends' && !S.searchQuery?'fbu-tab-active':''}" data-tab="unfriends">
                            💔 Eliminados <span class="fbu-badge" style="${S.tab==='unfriends'?'':'background-color:rgba(239,68,68,0.2); color:#ef4444;'}">${S.unfriends.length}</span>
                        </button>
                    </div>
                    
                    <button class="fbu-scan-btn" data-action="scan" ${S.isScanning?'disabled':''}>
                        ${S.isScanning ? 'Escaneando...' : '🔄 Escanear Ahora'}
                    </button>
                </div>
                
                <div class="fbu-main">
                    ${S.isScanning ? `
                        <div class="fbu-overlay">
                            <div class="fbu-spinner"></div>
                            <h2 style="margin:0;">Extrayendo imágenes y datos...</h2>
                            <p style="color:#9ca3af; margin-top:10px;">Amigos procesados: <b id="fbu-scan-count" style="color:#3b82f6; font-size:1.2rem;">0</b></p>
                            <p style="font-size:0.8rem; color:#6b7280;">No toques la página hasta que termine el proceso.</p>
                        </div>
                    ` : ''}

                    <input type="text" class="fbu-search-box" id="fbu-search" placeholder="🔍 Buscar amigo por nombre..." value="${S.searchQuery}">
                    
                    ${displayList.length === 0 ? `
                        <div class="fbu-empty">
                            <span>📭</span>
                            <p>${S.searchQuery ? 'No se encontraron amigos con ese nombre.' : 'No hay datos en esta categoría.'}</p>
                        </div>
                    ` : `
                        <div class="fbu-grid">
                            ${displayList.map(f => `
                                <a href="https://facebook.com/${f.id}" target="_blank" class="fbu-card ${S.tab==='unfriends' ? 'fbu-status-red' : ''}">
                                    <img src="${f.profile_pic_url || SAFE_AVATAR}" class="fbu-card-img" onerror="this.src='${SAFE_AVATAR}'">
                                    <div class="fbu-card-info">
                                        <div class="fbu-card-name">${f.fullname}</div>
                                        ${f.mutuals ? `<div class="fbu-card-mutual">🤝 ${f.mutuals}</div>` : ''}
                                        <div class="fbu-card-id">${S.tab==='unfriends' ? 'Ya no es tu amigo' : 'ID: '+f.id}</div>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
        
        let contentContainer = document.getElementById('fbu-content');
        if (!contentContainer) {
            contentContainer = document.createElement('div');
            contentContainer.id = 'fbu-content';
            contentContainer.style.display = 'flex';
            contentContainer.style.flexDirection = 'column';
            contentContainer.style.height = '100%';
            contentContainer.style.width = '100%';
            rootDiv.appendChild(contentContainer);
        }
        contentContainer.innerHTML = contentHtml;

        const searchInput = document.getElementById('fbu-search');
        if (searchInput) {
            searchInput.focus();
            let val = searchInput.value;
            searchInput.setSelectionRange(val.length, val.length); 
            
            searchInput.addEventListener('input', (e) => {
                S.searchQuery = e.target.value;
                if(S.searchQuery) S.tab = 'search';
                render();
            });
        }
    };

    document.addEventListener('click', (e) => {
        const target = e.target;
        const tabBtn = target.closest('.fbu-tab-btn');
        if (tabBtn) {
            S.tab = tabBtn.dataset.tab;
            S.searchQuery = ''; 
            render();
            return;
        }

        const btn = target.closest('[data-action]');
        if (btn) {
            if (btn.dataset.action === 'close') {
                document.getElementById('fbu-app-root')?.remove();
                window.fbuMasterRunning = false;
            }
            if (btn.dataset.action === 'scan') runScanner();
        }
    });

    saveDB(S.friends_old); 
    render();
    console.log("FB Sentinel Pro Listo para usar.");
})();