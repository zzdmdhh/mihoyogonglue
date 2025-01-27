// 页面元素 ID
const ELEMENTS = {
    announcement: 'announcement',
    announcementContent: '.announcement-content',
    codeWindow: 'codeWindow',
    codeList: 'codeList',
    dataTable: 'dataTable',
    viewTable: 'viewTable',
    announcementEditor: 'announcementEditor',
    gameSelect: 'gameSelect',
    serverSelect: 'serverSelect',
    codeInput: 'codeInput'
};

// 存储键名
const STORAGE_KEYS = {
    announcement: 'announcement',
    codes: 'redemptionCodes',
    tableData: gameType => `${gameType}TableData`
};

// 使用 localStorage 存储表格数据
let tableData = [];

// 页面加载时初始化
window.onload = function() {
    // 检查是否是管理页面
    if (window.location.pathname.includes('admin.html')) {
        initAdminPage();
    } 
    // 检查是否是游戏管理页面
    else if (window.location.pathname.includes('admin-')) {
        initGameAdminPage();
    }
    // 检查是否是游戏页面
    else if (window.location.pathname.includes('/html/') && 
            (window.location.pathname.includes('ys.html') || 
             window.location.pathname.includes('sr.html') || 
             window.location.pathname.includes('zzz.html'))) {
        initTableData();
    }
    // 首页
    else if (window.location.pathname.endsWith('index.html') || 
             window.location.pathname.endsWith('/')) {
        loadContent();
    }
}

// 初始化管理面板页面
function initAdminPage() {
    if (!sessionStorage.getItem('adminVerified')) {
        window.location.href = '../index.html';
        return;
    }

    const announcement = localStorage.getItem(STORAGE_KEYS.announcement);
    if (announcement) {
        document.getElementById(ELEMENTS.announcementEditor).value = announcement;
    }

    loadCodes();
}

// 初始化游戏管理页面
function initGameAdminPage() {
    if (!sessionStorage.getItem('adminVerified')) {
        const gameType = window.location.pathname.split('admin-')[1].split('.')[0];
        window.location.href = `${gameType}.html`;
        return;
    }
    initTableData();
}

// 加载首页内容
function loadContent() {
    loadAnnouncement();
    loadRedemptionCodes();
}

// 加载公告内容
function loadAnnouncement() {
    const announcement = localStorage.getItem(STORAGE_KEYS.announcement);
    const announcementDiv = document.getElementById(ELEMENTS.announcement);
    if (announcement) {
        document.querySelector(ELEMENTS.announcementContent).innerHTML = announcement;
        announcementDiv.style.display = 'block';
    } else {
        announcementDiv.style.display = 'none';
    }
}

// 加载兑换码
function loadRedemptionCodes() {
    const codes = JSON.parse(localStorage.getItem(STORAGE_KEYS.codes) || '[]');
    const codeList = document.getElementById(ELEMENTS.codeList);
    const codeWindow = document.getElementById(ELEMENTS.codeWindow);
    if (!codeList) return;
    
    if (codes.length === 0) {
        codeWindow.style.display = 'none';
        return;
    }

    codeWindow.style.display = 'block';
    loadCodes();
}

// 初始化表格数据
function initTableData() {
    const gamePage = window.location.pathname.split('/').pop().split('.')[0];
    const gameType = gamePage.includes('ys') ? 'ys' : 
                    gamePage.includes('sr') ? 'sr' : 
                    gamePage.includes('zzz') ? 'zzz' : '';
    
    const savedData = localStorage.getItem(STORAGE_KEYS.tableData(gameType));
    if (savedData) {
        tableData = JSON.parse(savedData);
        updateTable();
    } else {
        tableData = [
            ['攻略名称', '攻略源-你的影月月', '攻略源-莴苣某人', '攻略源-其他'],
            ['1', 'https://example.com/1', 'https://example.com/2', 'https://example.com/3']
        ];
        saveData();
    }
}

// 更新表格显示
function updateTable() {
    const table = document.getElementById(ELEMENTS.dataTable) || 
                 document.getElementById(ELEMENTS.viewTable);
    if (!table) return;

    table.innerHTML = '';
    tableData.forEach((rowData, rowIndex) => {
        const row = table.insertRow(-1);
        rowData.forEach((cellData, cellIndex) => {
            const cell = row.insertCell(-1);
            if (rowIndex === 0 || cellIndex === 0) {
                cell.textContent = cellData;
            } else {
                if (document.getElementById(ELEMENTS.viewTable)) {
                    cell.innerHTML = `<a href="${cellData}" target="_blank">${cellData}</a>`;
                } else {
                    cell.textContent = cellData;
                }
            }
            
            if (document.getElementById(ELEMENTS.dataTable) && rowIndex > 0) {
                cell.contentEditable = true;
                cell.addEventListener('blur', () => {
                    tableData[rowIndex][cellIndex] = cell.textContent;
                });
            }
        });
    });
}

// 表格操作函数
function addRow() {
    const table = document.getElementById(ELEMENTS.dataTable);
    if (!table) return;

    const newRow = ['新攻略', 'https://', 'https://', 'https://'];
    tableData.push(newRow);
    updateTable();
}

function deleteRow() {
    if (tableData.length <= 2) return;
    tableData.pop();
    updateTable();
}

function saveData() {
    if (!document.getElementById(ELEMENTS.dataTable)) return;
    
    const gamePage = window.location.pathname.split('/').pop().split('.')[0];
    const gameType = gamePage.includes('ys') ? 'ys' : 
                    gamePage.includes('sr') ? 'sr' : 
                    gamePage.includes('zzz') ? 'zzz' : '';
    
    localStorage.setItem(STORAGE_KEYS.tableData(gameType), JSON.stringify(tableData));
    alert('保存成功！');
}

// 管理员相关函数
function verifyGlobalAdmin() {
    const password = prompt('请输入管理员密码：');
    if (password === CONFIG.admin.password) {
        sessionStorage.setItem('adminVerified', 'true');
        window.location.href = './html/admin.html';
    } else {
        alert('密码错误！');
    }
}

function exitAdmin() {
    sessionStorage.removeItem('adminVerified');
    window.location.href = '../index.html';
}

// 兑换码相关函数
function loadCodes() {
    const codes = JSON.parse(localStorage.getItem(STORAGE_KEYS.codes) || '[]');
    const codeList = document.getElementById(ELEMENTS.codeList);
    if (!codeList) return;

    codeList.innerHTML = '';
    codes.forEach((code, index) => {
        const codeElement = document.createElement('div');
        codeElement.className = 'code-item' + (window.location.pathname.includes('admin') ? ' admin-code' : '');
        
        const gameConfig = CONFIG.games[code.game];
        const serverConfig = CONFIG.servers[code.server];
        
        if (!gameConfig || !serverConfig) {
            console.error('Invalid game or server config:', code);
            return;
        }

        codeElement.innerHTML = `
            <div class="code-info">
                <span class="game-tag" style="background-color: ${gameConfig.color}">${gameConfig.name}</span>
                <span class="server-tag" style="background-color: ${serverConfig.color}">${serverConfig.name}</span>
                <span class="code-text">${code.code}</span>
            </div>
            ${window.location.pathname.includes('admin') ? 
                `<button onclick="deleteCode(${index})" class="delete-button">删除</button>` :
                `<button onclick="navigator.clipboard.writeText('${code.code}')" class="copy-button">复制</button>`
            }
        `;
        codeList.appendChild(codeElement);
    });
}

function addCode() {
    const game = document.getElementById(ELEMENTS.gameSelect).value;
    const server = document.getElementById(ELEMENTS.serverSelect).value;
    const code = document.getElementById(ELEMENTS.codeInput).value.trim();

    if (!code) {
        alert('请输入兑换码！');
        return;
    }

    if (!CONFIG.games[game] || !CONFIG.servers[server]) {
        alert('无效的游戏或服务器选择！');
        return;
    }

    const codes = JSON.parse(localStorage.getItem(STORAGE_KEYS.codes) || '[]');
    codes.push({ game, server, code });
    localStorage.setItem(STORAGE_KEYS.codes, JSON.stringify(codes));

    document.getElementById(ELEMENTS.codeInput).value = '';
    loadCodes();
}

function deleteCode(index) {
    const codes = JSON.parse(localStorage.getItem(STORAGE_KEYS.codes) || '[]');
    codes.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.codes, JSON.stringify(codes));
    loadCodes();
}

// 公告管理
function saveAnnouncement() {
    const content = document.getElementById(ELEMENTS.announcementEditor).value;
    localStorage.setItem(STORAGE_KEYS.announcement, content);
    alert('公告已更新！');
}

// 获取游戏名称
function getGameName(game) {
    return CONFIG.games[game]?.name || game;
}

// 获取服务器名称
function getServerName(server) {
    return CONFIG.servers[server]?.name || server;
} 