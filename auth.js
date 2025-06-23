// Ініціалізація бази даних
const DB_NAME = 'DrawingAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

let db = null;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Помилка при відкритті бази даних:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'username' });
                store.createIndex('username', 'username', { unique: true });
            }
        };
    });
}

// Функція для збереження користувача
async function saveUser(username, password) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const user = { username, password };
        const request = store.add(user);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error("Помилка при збереженні користувача:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Функція для пошуку користувача
async function findUser(username) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.get(username);

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
            console.error("Помилка при пошуку користувача:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Основний код
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initDB();

        // Елементи форми входу
        const loginForm = document.getElementById('login-form');
        const loginBox = document.getElementById('login-box');
        const signupBox = document.getElementById('signup-box');
        const showSignupLink = document.getElementById('show-signup');
        const showLoginLink = document.getElementById('show-login');
        const loginErrorMessage = document.getElementById('login-error-message');
        const signupErrorMessage = document.getElementById('signup-error-message');
        const signupForm = document.getElementById('signup-form');

        // Перемикання на форму реєстрації
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginBox.style.display = 'none';
            signupBox.style.display = 'block';
        });

        // Перемикання на форму входу
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            signupBox.style.display = 'none';
            loginBox.style.display = 'block';
        });

        // Обробка входу
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            // Очищення повідомлення про помилку
            loginErrorMessage.style.display = 'none';
            loginErrorMessage.textContent = '';

            try {
                const user = await findUser(username);

                if (user && user.password === password) {
                    // Зберігаємо поточного користувача
                    localStorage.setItem('currentUser', username);
                    // Перенаправляємо на головну сторінку
                    window.location.href = 'index.html';
                } else {
                    loginErrorMessage.textContent = 'Неправильне ім\'я користувача або пароль!';
                    loginErrorMessage.style.display = 'block';
                }
            } catch (error) {
                loginErrorMessage.textContent = 'Сталася помилка при вході. Спробуйте ще раз.';
                loginErrorMessage.style.display = 'block';
                console.error('Помилка входу:', error);
            }
        });

        // Обробка реєстрації
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('signup-username').value.trim();
            const password = document.getElementById('signup-password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            // Очищення повідомлення про помилку
            signupErrorMessage.style.display = 'none';
            signupErrorMessage.textContent = '';

            // Перевірка збігу паролів
            if (password !== confirmPassword) {
                signupErrorMessage.textContent = 'Паролі не співпадають!';
                signupErrorMessage.style.display = 'block';
                return;
            }

            try {
                // Перевірка наявності користувача
                const existingUser = await findUser(username);

                if (existingUser) {
                    signupErrorMessage.textContent = 'Користувач з таким іменем вже існує!';
                    signupErrorMessage.style.display = 'block';
                } else {
                    // Збереження нового користувача
                    await saveUser(username, password);
                    alert('Реєстрація успішна! Тепер увійдіть у систему.');
                    // Перемикаємо на форму входу
                    signupBox.style.display = 'none';
                    loginBox.style.display = 'block';
                    // Очищаємо поля реєстрації
                    signupForm.reset();
                }
            } catch (error) {
                signupErrorMessage.textContent = 'Сталася помилка при реєстрації. Спробуйте ще раз.';
                signupErrorMessage.style.display = 'block';
                console.error('Помилка реєстрації:', error);
            }
        });
    } catch (error) {
        console.error('Помилка ініціалізації:', error);
        alert('Сталася критична помилка. Будь ласка, перезавантажте сторінку.');
    }
});