// ==UserScript==
// @name         D&D Beyond Quick Roster
// @namespace    http://tampermonkey.net/
// @version      29.0
// @description
// @author       OTTOREIKU
// @match        https://app.roll20.net/editor/
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Data & Settings Loading
    let characterData = GM_getValue('ddb_chars_v25', []);
    let customTabs = GM_getValue('ddb_custom_tabs_v25', []);
    let savedNotes = GM_getValue('ddb_notepad_content', '');

    // Default Settings
    const defaultSettings = {
        showNotepad: true,
        showNotebook: false,
        show5e: true,
        showNewTab: false,
        notebookUrl: ''
    };
    let userSettings = GM_getValue('ddb_settings_v1', defaultSettings);

    // Ensure all keys exist if updating from older version
    userSettings = { ...defaultSettings, ...userSettings };

    let autoRefresh = false;
    let highestZ = 100000;
    let isPinned = false;
    let isLocked = false;

    const TAB_COLORS = ['#444', '#8e44ad', '#2980b9', '#27ae60', '#d35400', '#c0392b', '#16a085'];

    // --- CSS STYLES ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* Master Container */
        #ddb-master-container {
            position: fixed;
            bottom: 30px;
            left: 20px;
            z-index: 100000;
            width: 120px;
            font-family: 'Segoe UI', sans-serif;
        }

        /* Expansion Container */
        #ddb-expansion-container {
            position: absolute;
            bottom: 100%;
            left: 0;
            width: 100%;
            display: flex;
            flex-direction: column-reverse;
            gap: 5px;
            margin-bottom: 5px;
            pointer-events: none;
        }

        #ddb-compact-stack, #ddb-menu { pointer-events: auto; }

        /* Main Red Button */
        .ddb-main-btn {
            background: #be1e2d;
            color: white;
            border: 2px solid #8c1616;
            padding: 10px 0;
            border-radius: 8px;
            cursor: move;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            user-select: none;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
            font-size: 13px;
            position: relative;
            z-index: 2;
        }

        /* Tools Row */
        .ddb-tools-row {
            display: flex;
            width: 100%;
            gap: 4px;
            margin-top: 5px;
            box-sizing: border-box;
        }

        /* Tool Buttons (Restored Greyscale Look) */
        .ddb-tool-btn {
            background: #222;
            color: #888;
            border: 1px solid #444;
            border-radius: 4px;
            font-size: 11px;
            height: 22px;
            line-height: 20px;
            cursor: pointer;
            padding: 0;
            transition: 0.2s;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            /* The requested greyscale look */
            filter: grayscale(100%);
            opacity: 0.8;
        }

        .ddb-half-btn { flex: 1; }
        .ddb-full-btn { width: 100%; margin-top: 4px; font-weight: bold; color: #aaa; }

        .ddb-tool-btn:hover {
            background: #333;
            opacity: 1;
            color: #ddd;
            filter: grayscale(0%);
        }

        .ddb-tool-btn.active {
            background: #555;
            color: #fff;
            border-color: #777;
            opacity: 1;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
            filter: grayscale(0%);
        }

        /* Compact Stack */
        #ddb-compact-stack {
            display: flex;
            flex-direction: column-reverse;
            gap: 5px;
            width: 100%;
        }

        .compact-btn {
            background: #333;
            color: #aaa;
            border: 1px solid #555;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: bold;
            transition: 0.2s;
            white-space: nowrap;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .compact-btn:hover { background: #444; color: #ffffff; border-color: #777; box-shadow: 0 0 8px rgba(255,255,255,0.1); }

        /* Menu */
        #ddb-menu {
            display: none;
            background: #1a1a1a;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 15px;
            color: white;
            width: 300px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.6);
            margin-bottom: 5px;
        }

        .ddb-menu-header { font-size: 11px; color: #888; margin-bottom: 12px; cursor: move; padding: 6px; background: #222; border-radius: 4px; text-align: center; font-weight: bold; }
        .ddb-section-header { font-size: 10px; color: #666; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 2px; }

        #ddb-add-section { margin-top: 5px; display: flex; flex-direction: column; gap: 8px; }

        /* Settings Section Styles */
        .ddb-setting-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; font-size: 11px; color: #ccc; }
        .ddb-setting-input { background: #000; border: 1px solid #444; color: #aaa; width: 100%; font-size: 10px; padding: 4px; margin-top: 2px; box-sizing: border-box; border-radius: 4px; }

        /* Checkbox styling */
        .ddb-checkbox { cursor: pointer; accent-color: #be1e2d; }

        .ddb-input-uniform { background: #000; border: 1px solid #555; color: white; padding: 0 8px; border-radius: 4px; font-size: 11px; width: 100%; height: 30px; box-sizing: border-box; }
        .ddb-btn-uniform { border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 10px; height: 30px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; box-sizing: border-box; width: 100%; }
        .ddb-btn-green { background: #4caf50; color: white; } .ddb-btn-green:hover { background: #45a049; }
        .ddb-btn-grey { background: #444; color: white; flex: 1; } .ddb-btn-grey:hover { background: #555; }

        /* Frame Styles */
        .ddb-frame-container {
            position: fixed;
            top: 50px;
            left: 50px;
            width: 1250px;
            height: 90%;
            background: #111;
            z-index: 100001;
            border: 2px solid #be1e2d;
            display: none;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(0,0,0,0.8);
            transition: z-index 0.1s;
        }

        .ddb-frame-header {
            background: #be1e2d;
            color: white;
            padding: 5px;
            min-height: 40px;
            height: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: move;
            flex-shrink: 0;
            flex-wrap: wrap;
        }

        .header-title { font-size: 11px; font-weight: bold; pointer-events: none; white-space: nowrap; }

        .ddb-tab-bar {
            display: flex;
            gap: 2px;
            flex-grow: 1;
            flex-wrap: wrap;
            height: auto;
            min-height: 32px;
            align-items: flex-end;
            padding-bottom: 0;
            pointer-events: auto;
        }

        .ddb-tab {
            background: rgba(0,0,0,0.2);
            color: #ddd;
            border-right: 1px solid rgba(255,255,255,0.1);
            padding: 0 12px;
            height: 32px;
            display: flex;
            align-items: center;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
            border-radius: 6px 6px 0 0;
            margin-bottom: 2px;
            transition: background 0.2s;
        }
        .ddb-tab:hover { filter: brightness(1.2); color: white; }
        .ddb-tab.active {
            background: #000000 !important;
            color: white;
            font-weight: bold;
            border-top: 2px solid #fff;
            height: 36px;
            margin-top: -4px;
            border-radius: 6px 6px 0 0;
            box-shadow: 0 -2px 5px rgba(0,0,0,0.5);
            z-index: 10;
        }

        .ddb-tab-close { margin-left: 8px; font-size: 14px; opacity: 0.6; padding: 0 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; }
        .ddb-tab-close:hover { opacity: 1; background: rgba(255,255,255,0.2); color: #ff4d4d; }

        /* FIXED: Flexible width for text buttons */
        .ddb-new-tab-btn {
            background: rgba(0,0,0,0.3);
            color: #ccc;
            min-width: 30px;
            width: auto;
            padding: 0 8px; /* Added padding for text */
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            border-radius: 4px;
            margin-left: 5px;
            transition: 0.2s;
        }
        .ddb-new-tab-btn:hover { background: #4caf50; color: white; }
        .hidden-btn { display: none !important; }

        /* FLOATING NOTEPAD STYLES */
        #ddb-notepad {
            position: fixed;
            bottom: 50px;
            right: 50px;
            width: 320px;
            height: 400px;
            min-width: 200px;
            min-height: 150px;
            background: radial-gradient(circle, #fdfbf0, #f2e6c8);
            border: 1px solid #d4c4a8;
            border-radius: 15px;
            box-shadow: 5px 5px 20px rgba(0,0,0,0.4);
            z-index: 100002;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Georgia', serif;
        }

        #ddb-notepad-header {
            background: rgba(139, 69, 19, 0.1);
            color: #5c4033;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: bold;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(139, 69, 19, 0.2);
            flex-shrink: 0;
        }

        #ddb-notepad-close { cursor: pointer; font-size: 14px; color: #8b4513; opacity: 0.6; }
        #ddb-notepad-close:hover { opacity: 1; }

        #ddb-notepad-area {
            flex-grow: 1;
            background: transparent;
            border: none;
            padding: 15px;
            resize: none;
            outline: none;
            color: #2c1e1e;
            font-size: 14px;
            line-height: 1.5;
            font-family: 'Georgia', 'Times New Roman', serif;
        }
        #ddb-notepad-area::placeholder { color: rgba(92, 64, 51, 0.4); font-style: italic; }
        #ddb-notepad-area::-webkit-scrollbar { width: 8px; }
        #ddb-notepad-area::-webkit-scrollbar-thumb { background: rgba(139, 69, 19, 0.3); border-radius: 4px; }

        .ddb-close-btn { background: rgba(0,0,0,0.2); border: none; color: white; font-size: 16px; font-weight: bold; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: auto; pointer-events: auto; transition: background 0.2s; }
        .ddb-close-btn:hover { background: #ff4d4d; }
        .refresh-toggle { font-size: 9px; padding: 2px 6px; border-radius: 3px; cursor: pointer; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white; pointer-events: auto; white-space: nowrap; }
        .refresh-toggle.on { background: #4caf50; border-color: #4caf50; }

        .ddb-resizer { position: absolute; width: 15px; height: 15px; z-index: 35; }
        .resizer-br { bottom: 0; right: 0; cursor: nwse-resize; }
        .resizer-bl { bottom: 0; left: 0; cursor: nesw-resize; }

        #ddb-iframe-container { flex-grow: 1; position: relative; width: 100%; height: 100%; }
        .ddb-char-iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; display: none; }
        .ddb-char-iframe.active { display: block; }
        #ddb-shield { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 30; display: none; }
    `;
    document.head.appendChild(style);

    // --- DOM CONSTRUCTION ---
    const master = document.createElement('div');
    master.id = 'ddb-master-container';

    master.innerHTML = `
        <div id="ddb-expansion-container">
            <div id="ddb-menu">
                <div class="ddb-menu-header" id="menu-drag-handle">PARTY</div>
                <div id="char-list"></div>

                <div class="ddb-section-header">Characters</div>
                <div id="ddb-add-section">
                    <input type="text" id="new-char-url" class="ddb-input-uniform" placeholder="Paste Character URL">
                    <button id="add-btn" class="ddb-btn-uniform ddb-btn-green">ADD CHARACTER</button>
                    <div style="display: flex; gap: 8px; width: 100%;">
                        <button id="export-btn" class="ddb-btn-uniform ddb-btn-grey">EXPORT</button>
                        <button id="import-btn" class="ddb-btn-uniform ddb-btn-grey">IMPORT</button>
                    </div>
                </div>

                <div class="ddb-section-header">Settings</div>
                <div id="ddb-settings-section">
                    <div class="ddb-setting-row"><span>Notepad Button</span><input type="checkbox" class="ddb-checkbox" id="set-notepad"></div>
                    <div class="ddb-setting-row"><span>NotebookLM Button</span><input type="checkbox" class="ddb-checkbox" id="set-notebook"></div>
                    <div class="ddb-setting-row"><span>5e Tools Button</span><input type="checkbox" class="ddb-checkbox" id="set-5e"></div>
                    <div class="ddb-setting-row"><span>New Tab Button</span><input type="checkbox" class="ddb-checkbox" id="set-newtab"></div>

                    <div style="margin-top: 5px;">
                        <span style="font-size:10px; color:#888;">NotebookLM URL:</span>
                        <input type="text" id="set-notebook-url" class="ddb-setting-input" value="${userSettings.notebookUrl}">
                    </div>
                </div>
            </div>
            <div id="ddb-compact-stack"></div>
        </div>
        <div class="ddb-main-btn" id="ddb-drag-handle">D&D BEYOND</div>
        <div class="ddb-tools-row">
            <div id="ddb-pin-btn" class="ddb-tool-btn ddb-half-btn" title="Pin Position">📌</div>
            <div id="ddb-lock-btn" class="ddb-tool-btn ddb-half-btn" title="Lock Menu">🔒</div>
        </div>
        <div id="ddb-open-note-direct" class="ddb-tool-btn ddb-full-btn" title="Toggle Notepad">NOTEPAD</div>
    `;
    document.body.appendChild(master);

    const frame = document.createElement('div');
    frame.className = 'ddb-frame-container';
    frame.id = 'ddb-sheet-viewer';
    frame.innerHTML = `
        <div class="ddb-frame-header" id="frame-drag-handle">
            <span class="header-title">PARTY VIEWER</span>
            <button id="auto-refresh-toggle" class="refresh-toggle">AUTO-REFRESH: OFF</button>
            <div class="ddb-tab-bar" id="ddb-tab-bar"></div>

            <div class="ddb-new-tab-btn" id="btn-open-notepad" title="Open Notepad" style="margin-left: 5px;">Note</div>
            <div class="ddb-new-tab-btn" id="btn-notebook" title="Open NotebookLM" style="margin-left: 5px; filter: grayscale(100%);">📓</div>
            <div class="ddb-new-tab-btn" id="btn-5etools" title="Open 5eTools" style="margin-left: 5px;">5e</div>
            <div class="ddb-new-tab-btn" id="add-custom-tab" title="Add New Tab">+</div>

            <button class="ddb-close-btn" id="close-frame">&times;</button>
        </div>
        <div id="ddb-shield"></div>
        <div id="ddb-iframe-container"></div>
        <div class="ddb-resizer resizer-br" id="resize-br"></div>
        <div class="ddb-resizer resizer-bl" id="resize-bl"></div>
    `;
    document.body.appendChild(frame);

    // --- FLOATING NOTEPAD ELEMENT ---
    const notepad = document.createElement('div');
    notepad.id = 'ddb-notepad';
    notepad.innerHTML = `
        <div id="ddb-notepad-header">
            <span>Session Notes</span>
            <span id="ddb-notepad-close">&times;</span>
        </div>
        <textarea id="ddb-notepad-area" placeholder="Jot down quick notes here...">${savedNotes}</textarea>
        <div class="ddb-resizer resizer-br" id="note-resize-br" style="opacity: 0.5;"></div>
    `;
    document.body.appendChild(notepad);

    // --- FUNCTIONS ---
    const bringToFront = (el) => { highestZ++; el.style.zIndex = highestZ; };
    master.addEventListener('mousedown', () => bringToFront(master));
    frame.addEventListener('mousedown', () => bringToFront(frame));
    notepad.addEventListener('mousedown', () => bringToFront(notepad));

    const makeDraggable = (el, handle) => {
        let p1=0, p2=0, p3=0, p4=0;
        handle.onmousedown = (e) => {
            if (el.id === 'ddb-master-container' && isPinned) return;
            if(e.target !== handle && !handle.contains(e.target)) return;
            bringToFront(el);
            p3 = e.clientX; p4 = e.clientY;
            document.onmouseup = () => { document.onmousemove = null; };
            document.onmousemove = (e) => {
                p1 = p3 - e.clientX; p2 = p4 - e.clientY; p3 = e.clientX; p4 = e.clientY;
                let newTop = el.offsetTop - p2;
                let newLeft = el.offsetLeft - p1;
                if (newTop < 0) newTop = 0;
                if (newLeft < 0) newLeft = 0;
                if (newLeft > window.innerWidth - 50) newLeft = window.innerWidth - 50;
                if (newTop > window.innerHeight - 50) newTop = window.innerHeight - 50;
                el.style.top = newTop + "px"; el.style.left = newLeft + "px"; el.style.bottom = 'auto'; el.style.right = 'auto';
            };
        };
    };

    const makeResizable = (el, handle, dir) => {
        handle.onmousedown = (e) => {
            e.stopPropagation();
            bringToFront(el);
            const shield = document.getElementById('ddb-shield');
            if(el.id === 'ddb-sheet-viewer') shield.style.display = 'block';
            let startW = el.offsetWidth; let startH = el.offsetHeight;
            let startX = e.clientX; let startY = e.clientY; let startL = el.offsetLeft;
            const onMouseMove = (ev) => {
                if (dir === 'br') { el.style.width = (startW + ev.clientX - startX) + 'px'; el.style.height = (startH + ev.clientY - startY) + 'px'; }
                else if (dir === 'bl') { el.style.width = (startW - (ev.clientX - startX)) + 'px'; el.style.left = (startL + (ev.clientX - startX)) + 'px'; el.style.height = (startH + ev.clientY - startY) + 'px'; }
            };
            const stopResize = () => { if(el.id === 'ddb-sheet-viewer') shield.style.display = 'none'; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', stopResize); };
            document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', stopResize);
        };
    };

    makeResizable(frame, document.getElementById('resize-br'), 'br');
    makeResizable(frame, document.getElementById('resize-bl'), 'bl');
    makeResizable(notepad, document.getElementById('note-resize-br'), 'br');

    // --- VISIBILITY & SETTINGS LOGIC ---
    const updateVisibility = () => {
        // Toggle Main Buttons
        const toggle = (id, show) => {
            const el = document.getElementById(id);
            if(el) {
                if(show) el.classList.remove('hidden-btn');
                else el.classList.add('hidden-btn');
            }
        };

        toggle('btn-open-notepad', userSettings.showNotepad);
        toggle('ddb-open-note-direct', userSettings.showNotepad);
        toggle('btn-notebook', userSettings.showNotebook);
        toggle('btn-5etools', userSettings.show5e);
        toggle('add-custom-tab', userSettings.showNewTab);

        // Update Inputs in Menu
        document.getElementById('set-notepad').checked = userSettings.showNotepad;
        document.getElementById('set-notebook').checked = userSettings.showNotebook;
        document.getElementById('set-5e').checked = userSettings.show5e;
        document.getElementById('set-newtab').checked = userSettings.showNewTab;
    };

    const saveSettings = () => {
        userSettings.showNotepad = document.getElementById('set-notepad').checked;
        userSettings.showNotebook = document.getElementById('set-notebook').checked;
        userSettings.show5e = document.getElementById('set-5e').checked;
        userSettings.showNewTab = document.getElementById('set-newtab').checked;
        userSettings.notebookUrl = document.getElementById('set-notebook-url').value;
        GM_setValue('ddb_settings_v1', userSettings);
        updateVisibility();
    };

    // Attach Setting Listeners
    ['set-notepad', 'set-notebook', 'set-5e', 'set-newtab'].forEach(id => {
        document.getElementById(id).onchange = saveSettings;
    });
    document.getElementById('set-notebook-url').onchange = saveSettings;


    // --- MAIN APP LOGIC ---
    const openSheet = (id, type) => {
        bringToFront(frame);
        const container = document.getElementById('ddb-iframe-container');
        let iframe = document.getElementById(`iframe-${id}`);

        let url;
        if (id === '5etools') {
            url = 'https://ottoreiku.github.io/5etools-Trevelyan/';
        } else {
            url = type === 'char' ? `https://www.dndbeyond.com/characters/${id}` : `https://www.dndbeyond.com`;
        }

        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = `iframe-${id}`;
            iframe.className = 'ddb-char-iframe';
            iframe.src = url;
            container.appendChild(iframe);
        } else if (autoRefresh) { iframe.src = iframe.src; }

        document.querySelectorAll('.ddb-char-iframe').forEach(el => el.classList.remove('active'));
        iframe.classList.add('active');
        frame.style.display = 'flex';
        updateTabs(id);
    };

    const updateTabs = (activeId) => {
        const tabBar = document.getElementById('ddb-tab-bar');
        tabBar.innerHTML = '';
        characterData.forEach(char => {
            const tab = document.createElement('div');
            tab.className = `ddb-tab ${char.id === activeId ? 'active' : ''}`;
            tab.innerText = char.name.toUpperCase();
            tab.onclick = (e) => { e.stopPropagation(); openSheet(char.id, 'char'); };
            tabBar.appendChild(tab);
        });
        customTabs.forEach((tabData, index) => {
            const tab = document.createElement('div');
            tab.className = `ddb-tab ${tabData.id === activeId ? 'active' : ''}`;
            if(tabData.id !== activeId) { tab.style.backgroundColor = tabData.color || '#444'; }
            tab.title = "Shift+Click to change Color | Right-click to Rename";
            const nameSpan = document.createElement('span'); nameSpan.innerText = tabData.name; tab.appendChild(nameSpan);
            const closeBtn = document.createElement('span'); closeBtn.className = 'ddb-tab-close'; closeBtn.innerHTML = '&times;';
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                const iframe = document.getElementById(`iframe-${tabData.id}`);
                if(iframe) iframe.remove();
                customTabs.splice(index, 1);
                GM_setValue('ddb_custom_tabs_v25', customTabs);
                if(tabData.id === activeId) {
                    if (characterData.length > 0) openSheet(characterData[0].id, 'char');
                    else if (customTabs.length > 0) openSheet(customTabs[0].id, 'custom');
                    else { frame.style.display = 'none'; updateTabs(null); }
                } else { updateTabs(activeId); }
            };
            tab.appendChild(closeBtn);
            tab.onclick = (e) => {
                if (e.shiftKey) {
                    e.stopPropagation();
                    let colorIdx = TAB_COLORS.indexOf(tabData.color || '#444');
                    let nextColor = TAB_COLORS[(colorIdx + 1) % TAB_COLORS.length];
                    customTabs[index].color = nextColor;
                    GM_setValue('ddb_custom_tabs_v25', customTabs);
                    updateTabs(activeId);
                } else { e.stopPropagation(); openSheet(tabData.id, 'custom'); }
            };
            tab.oncontextmenu = (e) => {
                e.preventDefault();
                const newName = prompt("Rename Tab:", tabData.name);
                if (newName) { customTabs[index].name = newName; GM_setValue('ddb_custom_tabs_v25', customTabs); updateTabs(activeId); }
            };
            tabBar.appendChild(tab);
        });

        const btn5e = document.getElementById('btn-5etools');
        if (activeId === '5etools') {
            btn5e.style.backgroundColor = '#4caf50';
            btn5e.style.color = 'white';
        } else {
            btn5e.style.backgroundColor = '';
            btn5e.style.color = '';
        }
    };

    document.getElementById('add-custom-tab').onclick = () => {
        const newID = 'custom-' + Date.now();
        const newName = `Tab ${customTabs.length + 1}`;
        customTabs.push({ id: newID, name: newName, color: TAB_COLORS[1] });
        GM_setValue('ddb_custom_tabs_v25', customTabs);
        openSheet(newID, 'custom');
    };

    document.getElementById('btn-5etools').onclick = () => {
        openSheet('5etools', 'external');
    };

    // UPDATED NOTEBOOK LOGIC (Uses saved URL)
    document.getElementById('btn-notebook').onclick = () => {
        window.open(userSettings.notebookUrl, '_blank');
    };

    // --- NOTEPAD LOGIC ---
    const toggleNotepad = () => {
        const isOpen = notepad.style.display === 'flex';
        notepad.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) bringToFront(notepad);
    };

    document.getElementById('btn-open-notepad').onclick = toggleNotepad;
    document.getElementById('ddb-open-note-direct').onclick = toggleNotepad;
    document.getElementById('ddb-notepad-close').onclick = () => { notepad.style.display = 'none'; };

    document.getElementById('ddb-notepad-area').addEventListener('input', (e) => {
        GM_setValue('ddb_notepad_content', e.target.value);
    });

    const renderRoster = () => {
        const list = document.getElementById('char-list');
        const stack = document.getElementById('ddb-compact-stack');
        list.innerHTML = ''; stack.innerHTML = '';
        characterData.forEach((char, index) => {
            const item = document.createElement('div');
            item.className = 'char-item';
            item.style = "display: flex; align-items: center; justify-content: space-between; padding: 10px 5px; border-bottom: 1px solid #333; cursor: pointer;";
            item.innerHTML = `<span style="flex-grow:1; font-size: 13px;">${char.name}</span><div style="display:flex; gap:12px;"><span style="color:#4caf50; font-size:11px; font-weight:bold;" data-idx="${index}">EDIT</span><span style="color:#ff4d4d; font-size:11px; font-weight:bold;" data-del="${index}">DEL</span></div>`;
            item.onclick = (e) => {
                if (e.target.dataset.del) { if(confirm(`Delete ${char.name}?`)){characterData.splice(index, 1); save();} }
                else if (e.target.dataset.idx) { const n = prompt("New name:", char.name); if(n){characterData[index].name=n; save();} }
                else { openSheet(char.id, 'char'); }
            };
            list.appendChild(item);
            const cBtn = document.createElement('div');
            cBtn.className = 'compact-btn'; cBtn.innerText = char.name;
            cBtn.onclick = () => openSheet(char.id, 'char');
            stack.appendChild(cBtn);
        });
    };

    const save = () => { GM_setValue('ddb_chars_v25', characterData); renderRoster(); };

    makeDraggable(master, document.getElementById('ddb-drag-handle'));
    makeDraggable(master, document.getElementById('menu-drag-handle'));
    makeDraggable(frame, document.getElementById('frame-drag-handle'));
    makeDraggable(notepad, document.getElementById('ddb-notepad-header'));

    document.getElementById('ddb-drag-handle').onclick = () => {
        if (isLocked) return;
        bringToFront(master);
        const menu = document.getElementById('ddb-menu');
        const stack = document.getElementById('ddb-compact-stack');
        const isOpen = menu.style.display === 'block';
        if (isOpen) { menu.style.display = 'none'; stack.style.display = 'flex'; }
        else { menu.style.display = 'block'; stack.style.display = 'none'; }
    };

    document.getElementById('ddb-pin-btn').onclick = function() {
        isPinned = !isPinned;
        this.classList.toggle('active', isPinned);
    };

    document.getElementById('ddb-lock-btn').onclick = function() {
        isLocked = !isLocked;
        this.classList.toggle('active', isLocked);
        if (isLocked) {
            const menu = document.getElementById('ddb-menu');
            const stack = document.getElementById('ddb-compact-stack');
            menu.style.display = 'none';
            stack.style.display = 'flex';
        }
    };

    document.getElementById('add-btn').onclick = () => {
        const urlInput = document.getElementById('new-char-url');
        const idMatch = urlInput.value.match(/\/characters\/(\d+)/);
        if (idMatch) {
            const id = idMatch[1];
            GM_xmlhttpRequest({
                method: "GET", url: `https://www.dndbeyond.com/characters/${id}`,
                onload: (r) => {
                    const t = document.createElement('div'); t.innerHTML = r.responseText;
                    const n = t.querySelector('.character-name');
                    characterData.push({ id, name: n ? n.innerText.trim() : `ID: ${id}` });
                    save(); urlInput.value = '';
                }
            });
        }
    };

    document.getElementById('auto-refresh-toggle').onclick = function() {
        autoRefresh = !autoRefresh;
        this.innerText = `AUTO-REFRESH: ${autoRefresh ? 'ON' : 'OFF'}`;
        this.classList.toggle('on', autoRefresh);
    };

    document.getElementById('close-frame').onclick = () => { frame.style.display='none'; };
    document.getElementById('export-btn').onclick = () => { prompt("Sync code:", btoa(JSON.stringify(characterData))); };
    document.getElementById('import-btn').onclick = () => { const code = prompt("Paste code:"); if(code){ try{characterData=JSON.parse(atob(code)); save();}catch(e){}} };

    renderRoster();
    updateVisibility(); // Apply saved settings on load
})();