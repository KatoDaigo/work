// 定数定義
const HOURLY_RATE = 1120;
const BONUS_6_MONTH = 600;
const BONUS_12_MONTH = 1100;
const BONUS_24_MONTH = 1400;
const FUMIN_RATE = 8500;
const MINKAN_RATE = 8000;

// ====== Firebase認証 ======

let currentUser = null;

// Googleでログイン
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            console.log('ログイン成功:', result.user.email);
        })
        .catch((error) => {
            console.error('ログインエラー:', error);
            alert('ログインに失敗しました: ' + error.message);
        });
}

// ログアウト
function signOut() {
    auth.signOut()
        .then(() => {
            console.log('ログアウト成功');
        })
        .catch((error) => {
            console.error('ログアウトエラー:', error);
            alert('ログアウトに失敗しました: ' + error.message);
        });
}

// 認証状態の監視
auth.onAuthStateChanged((user) => {
    currentUser = user;

    if (user) {
        // ログイン中
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('user-email').textContent = user.email;

        // データを読み込む
        loadDashboard();
        loadYomiuriRecords();
        loadChirashiRecords();
    } else {
        // ログアウト中
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('user-email').textContent = '';

        // データをクリア
        clearAllData();
    }
});

function clearAllData() {
    document.getElementById('yomiuri-records-list').innerHTML = '<div class="no-records">ログインしてください</div>';
    document.getElementById('chirashi-records-list').innerHTML = '<div class="no-records">ログインしてください</div>';
    document.getElementById('monthly-table-body').innerHTML = '';
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // タブ切り替え
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // ダッシュボードに切り替わったら更新
            if (targetTab === 'dashboard') {
                loadDashboard();
            }
        });
    });

    // 現在の日付を設定
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = today.toISOString().slice(0, 7);

    document.getElementById('yomiuri-date').value = todayStr;
    document.getElementById('yomiuri-month').value = monthStr;
    document.getElementById('chirashi-date').value = todayStr;
    document.getElementById('chirashi-month').value = monthStr;

    // 月が変更されたときに記録を更新
    document.getElementById('yomiuri-month').addEventListener('change', function() {
        loadYomiuriRecords();
    });

    document.getElementById('chirashi-month').addEventListener('change', function() {
        loadChirashiRecords();
    });

    // 年度セレクターの初期化
    initYearSelector();

    // 年度が変更されたときにダッシュボードを更新
    document.getElementById('dashboard-year').addEventListener('change', function() {
        loadDashboard();
    });

    // 初期表示
    loadDashboard();
    loadYomiuriRecords();
    loadChirashiRecords();
});

// ====== ダッシュボード ======

function initYearSelector() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('dashboard-year');

    // 過去5年から未来2年まで
    for (let year = currentYear - 5; year <= currentYear + 2; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

async function loadDashboard() {
    const selectedYear = document.getElementById('dashboard-year').value;
    const yomiuriRecords = await getYomiuriRecords();
    const chirashiRecords = await getChirashiRecords();

    // 年間集計
    let yearlyYomiuri = 0;
    let yearlyChirashi = 0;

    yomiuriRecords.forEach(record => {
        if (record.date.startsWith(selectedYear)) {
            yearlyYomiuri += record.total;
        }
    });

    chirashiRecords.forEach(record => {
        if (record.date.startsWith(selectedYear)) {
            yearlyChirashi += record.amount;
        }
    });

    const yearlyTotal = yearlyYomiuri + yearlyChirashi;

    // 年間合計を表示
    document.getElementById('yearly-total').textContent = `¥${yearlyTotal.toLocaleString()}`;
    document.getElementById('yearly-yomiuri').textContent = `¥${yearlyYomiuri.toLocaleString()}`;
    document.getElementById('yearly-chirashi').textContent = `¥${yearlyChirashi.toLocaleString()}`;

    // 月別集計
    const monthlyData = {};

    for (let month = 1; month <= 12; month++) {
        const monthStr = `${selectedYear}-${String(month).padStart(2, '0')}`;
        monthlyData[monthStr] = {
            yomiuri: 0,
            chirashi: 0,
            total: 0
        };
    }

    yomiuriRecords.forEach(record => {
        const monthStr = record.date.substring(0, 7);
        if (monthlyData[monthStr]) {
            monthlyData[monthStr].yomiuri += record.total;
        }
    });

    chirashiRecords.forEach(record => {
        const monthStr = record.date.substring(0, 7);
        if (monthlyData[monthStr]) {
            monthlyData[monthStr].chirashi += record.amount;
        }
    });

    // 月別テーブルを作成
    const tableBody = document.getElementById('monthly-table-body');
    tableBody.innerHTML = '';

    for (let month = 1; month <= 12; month++) {
        const monthStr = `${selectedYear}-${String(month).padStart(2, '0')}`;
        const data = monthlyData[monthStr];
        data.total = data.yomiuri + data.chirashi;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="month-cell">${month}月</td>
            <td>¥${data.yomiuri.toLocaleString()}</td>
            <td>¥${data.chirashi.toLocaleString()}</td>
            <td class="total-cell">¥${data.total.toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    }
}

// ====== 読売新聞 ======

async function saveYomiuriRecord() {
    if (!currentUser) {
        alert('ログインしてください');
        return;
    }

    const date = document.getElementById('yomiuri-date').value;
    if (!date) {
        alert('日付を選択してください');
        return;
    }

    const yc = document.getElementById('yomiuri-yc').value.trim();
    const hours = parseFloat(document.getElementById('yomiuri-hours').value) || 0;
    const transport = parseFloat(document.getElementById('yomiuri-transport').value) || 0;
    const contract6 = parseInt(document.getElementById('contract-6').value) || 0;
    const contract12 = parseInt(document.getElementById('contract-12').value) || 0;
    const contract24 = parseInt(document.getElementById('contract-24').value) || 0;

    // 計算
    const baseSalary = hours * HOURLY_RATE;
    const contractBonus = (contract6 * BONUS_6_MONTH) + (contract12 * BONUS_12_MONTH) + (contract24 * BONUS_24_MONTH);
    const total = baseSalary + transport + contractBonus;

    // 編集中のIDを取得（隠しフィールドから）
    const editingId = document.getElementById('yomiuri-editing-id') ? document.getElementById('yomiuri-editing-id').value : null;

    const recordData = {
        date: date,
        yc: yc,
        hours: hours,
        transport: transport,
        contract6: contract6,
        contract12: contract12,
        contract24: contract24,
        baseSalary: baseSalary,
        contractBonus: contractBonus,
        total: total
    };

    try {
        const collectionRef = db.collection('users').doc(currentUser.uid).collection('yomiuri_records');

        if (editingId) {
            // 既存の記録を更新
            await collectionRef.doc(editingId).set(recordData);
            document.getElementById('yomiuri-editing-id').value = '';
        } else {
            // 新規記録を追加
            await collectionRef.add(recordData);
        }

        // フォームをクリア
        document.getElementById('yomiuri-yc').value = '';
        document.getElementById('yomiuri-hours').value = '';
        document.getElementById('yomiuri-transport').value = '';
        document.getElementById('contract-6').value = '';
        document.getElementById('contract-12').value = '';
        document.getElementById('contract-24').value = '';

        // 記録を再読み込み
        await loadYomiuriRecords();
        await loadDashboard(); // ダッシュボードも更新
    } catch (error) {
        console.error('データ保存エラー:', error);
        alert('データの保存に失敗しました: ' + error.message);
    }
}

async function getYomiuriRecords() {
    if (!currentUser) {
        return [];
    }

    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('yomiuri_records')
            .get();

        const records = [];
        snapshot.forEach(doc => {
            records.push({
                id: doc.id,
                ...doc.data()
            });
        });

        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        return records;
    } catch (error) {
        console.error('読売新聞データの取得エラー:', error);
        return [];
    }
}

async function loadYomiuriRecords() {
    const month = document.getElementById('yomiuri-month').value;
    const allRecords = await getYomiuriRecords();
    const records = allRecords.filter(r => r.date.startsWith(month));

    // 記録リストを表示
    const listElement = document.getElementById('yomiuri-records-list');
    if (records.length === 0) {
        listElement.innerHTML = '<div class="no-records">記録がありません</div>';
    } else {
        listElement.innerHTML = records.map(record => {
            const ycDisplay = record.yc ? `${record.yc} / ` : '';
            const recordId = record.id || Date.now().toString(); // 既存の記録にIDがない場合の対応
            return `
                <div class="record-item">
                    <div>
                        <div class="record-date">${formatDate(record.date)}</div>
                        <div style="font-size: 0.85em; color: #666; margin-top: 4px;">
                            ${ycDisplay}${record.hours}h / 交通費¥${record.transport.toLocaleString()} / 契約${record.contract6 + record.contract12 + record.contract24}件
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="record-amount">¥${record.total.toLocaleString()}</div>
                        <button class="record-edit" onclick="editYomiuriRecord('${recordId}')">編集</button>
                        <button class="record-delete" onclick="deleteYomiuriRecord('${recordId}')">削除</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 月間集計を計算
    const summary = {
        baseSalary: 0,
        transport: 0,
        contractBonus: 0,
        contract6: 0,
        contract12: 0,
        contract24: 0,
        days: records.length,
        total: 0
    };

    records.forEach(record => {
        summary.baseSalary += record.baseSalary;
        summary.transport += record.transport;
        summary.contractBonus += record.contractBonus;
        summary.contract6 += record.contract6 || 0;
        summary.contract12 += record.contract12 || 0;
        summary.contract24 += record.contract24 || 0;
        summary.total += record.total;
    });

    const totalContracts = summary.contract6 + summary.contract12 + summary.contract24;

    // 集計を表示
    document.getElementById('yomiuri-summary-base').textContent = `¥${summary.baseSalary.toLocaleString()}`;
    document.getElementById('yomiuri-summary-transport').textContent = `¥${summary.transport.toLocaleString()}`;
    document.getElementById('yomiuri-summary-bonus').textContent = `¥${summary.contractBonus.toLocaleString()}`;
    document.getElementById('yomiuri-summary-contracts').textContent = `${totalContracts}件（6ヶ月:${summary.contract6} / 12ヶ月:${summary.contract12} / 24ヶ月:${summary.contract24}）`;
    document.getElementById('yomiuri-summary-days').textContent = `${summary.days}日`;
    document.getElementById('yomiuri-summary-total').textContent = `¥${summary.total.toLocaleString()}`;
}

function editYomiuriRecord(id) {
    const records = getYomiuriRecords();
    const record = records.find(r => r.id === id);

    if (!record) return;

    // フォームに値を設定
    document.getElementById('yomiuri-date').value = record.date;
    document.getElementById('yomiuri-yc').value = record.yc || '';
    document.getElementById('yomiuri-hours').value = record.hours || '';
    document.getElementById('yomiuri-transport').value = record.transport || '';
    document.getElementById('contract-6').value = record.contract6 || '';
    document.getElementById('contract-12').value = record.contract12 || '';
    document.getElementById('contract-24').value = record.contract24 || '';

    // 編集中のIDを保存（隠しフィールド）
    let editingIdField = document.getElementById('yomiuri-editing-id');
    if (!editingIdField) {
        editingIdField = document.createElement('input');
        editingIdField.type = 'hidden';
        editingIdField.id = 'yomiuri-editing-id';
        document.getElementById('yomiuri').appendChild(editingIdField);
    }
    editingIdField.value = id;

    // フォームまでスクロール
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

async function deleteYomiuriRecord(id) {
    if (!confirm('この記録を削除しますか？')) return;

    if (!currentUser) {
        alert('ログインしてください');
        return;
    }

    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('yomiuri_records')
            .doc(id)
            .delete();

        await loadYomiuriRecords();
        await loadDashboard(); // ダッシュボードも更新
    } catch (error) {
        console.error('データ削除エラー:', error);
        alert('データの削除に失敗しました: ' + error.message);
    }
}

// ====== チラシ ======

async function saveChirashiRecord() {
    if (!currentUser) {
        alert('ログインしてください');
        return;
    }

    const date = document.getElementById('chirashi-date').value;
    if (!date) {
        alert('日付を選択してください');
        return;
    }

    const type = document.getElementById('chirashi-type').value;
    const amount = type === 'fumin' ? FUMIN_RATE : MINKAN_RATE;

    // 編集中のIDを取得（隠しフィールドから）
    const editingId = document.getElementById('chirashi-editing-id') ? document.getElementById('chirashi-editing-id').value : null;

    const recordData = {
        date: date,
        type: type,
        amount: amount
    };

    try {
        const collectionRef = db.collection('users').doc(currentUser.uid).collection('chirashi_records');

        if (editingId) {
            // 既存の記録を更新
            await collectionRef.doc(editingId).set(recordData);
            document.getElementById('chirashi-editing-id').value = '';
        } else {
            // 新規記録を追加
            await collectionRef.add(recordData);
        }

        // 記録を再読み込み
        await loadChirashiRecords();
        await loadDashboard(); // ダッシュボードも更新
    } catch (error) {
        console.error('データ保存エラー:', error);
        alert('データの保存に失敗しました: ' + error.message);
    }
}

async function getChirashiRecords() {
    if (!currentUser) {
        return [];
    }

    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('chirashi_records')
            .get();

        const records = [];
        snapshot.forEach(doc => {
            records.push({
                id: doc.id,
                ...doc.data()
            });
        });

        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        return records;
    } catch (error) {
        console.error('チラシデータの取得エラー:', error);
        return [];
    }
}

async function loadChirashiRecords() {
    const month = document.getElementById('chirashi-month').value;
    const allRecords = await getChirashiRecords();
    const records = allRecords.filter(r => r.date.startsWith(month));

    // 記録リストを表示
    const listElement = document.getElementById('chirashi-records-list');
    if (records.length === 0) {
        listElement.innerHTML = '<div class="no-records">記録がありません</div>';
    } else {
        listElement.innerHTML = records.map(record => {
            const typeLabel = record.type === 'fumin' ? '府民稼働' : '民間稼働';
            const recordId = record.id || Date.now().toString(); // 既存の記録にIDがない場合の対応
            return `
                <div class="record-item">
                    <div>
                        <div class="record-date">${formatDate(record.date)}</div>
                        <div style="font-size: 0.85em; color: #666; margin-top: 4px;">
                            ${typeLabel}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="record-amount">¥${record.amount.toLocaleString()}</div>
                        <button class="record-edit" onclick="editChirashiRecord('${recordId}')">編集</button>
                        <button class="record-delete" onclick="deleteChirashiRecord('${recordId}')">削除</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 月間集計を計算
    const summary = {
        fuminDays: 0,
        fuminAmount: 0,
        minkanDays: 0,
        minkanAmount: 0,
        total: 0
    };

    records.forEach(record => {
        if (record.type === 'fumin') {
            summary.fuminDays++;
            summary.fuminAmount += record.amount;
        } else {
            summary.minkanDays++;
            summary.minkanAmount += record.amount;
        }
        summary.total += record.amount;
    });

    // 集計を表示
    document.getElementById('chirashi-summary-fumin').textContent =
        `${summary.fuminDays}日 / ¥${summary.fuminAmount.toLocaleString()}`;
    document.getElementById('chirashi-summary-minkan').textContent =
        `${summary.minkanDays}日 / ¥${summary.minkanAmount.toLocaleString()}`;
    document.getElementById('chirashi-summary-days').textContent =
        `${records.length}日`;
    document.getElementById('chirashi-summary-total').textContent =
        `¥${summary.total.toLocaleString()}`;
}

function editChirashiRecord(id) {
    const records = getChirashiRecords();
    const record = records.find(r => r.id === id);

    if (!record) return;

    // フォームに値を設定
    document.getElementById('chirashi-date').value = record.date;
    document.getElementById('chirashi-type').value = record.type;

    // 編集中のIDを保存（隠しフィールド）
    let editingIdField = document.getElementById('chirashi-editing-id');
    if (!editingIdField) {
        editingIdField = document.createElement('input');
        editingIdField.type = 'hidden';
        editingIdField.id = 'chirashi-editing-id';
        document.getElementById('chirashi').appendChild(editingIdField);
    }
    editingIdField.value = id;

    // フォームまでスクロール
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

async function deleteChirashiRecord(id) {
    if (!confirm('この記録を削除しますか？')) return;

    if (!currentUser) {
        alert('ログインしてください');
        return;
    }

    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('chirashi_records')
            .doc(id)
            .delete();

        await loadChirashiRecords();
        await loadDashboard(); // ダッシュボードも更新
    } catch (error) {
        console.error('データ削除エラー:', error);
        alert('データの削除に失敗しました: ' + error.message);
    }
}

// ====== ユーティリティ ======

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日（${weekday}）`;
}
