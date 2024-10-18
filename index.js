const { Command } = require('commander'); // Імпортуємо модуль Commander.js
const http = require('http'); // Імпортуємо модуль http для створення сервера
const fs = require('fs').promises; // Імпортуємо модуль fs для роботи з файлами
const path = require('path'); // Імпортуємо модуль path для роботи з шляхами

// Створюємо новий об'єкт програми командного рядка
const program = new Command();

// Визначаємо параметри командного рядка
program
  .requiredOption('-h, --host <host>', 'адреса сервера') // Параметр host
  .requiredOption('-p, --port <port>', 'порт сервера') // Параметр port
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу'); // Параметр cache

// Парсимо аргументи командного рядка
program.parse(process.argv);

// Отримуємо параметри
const options = program.opts();
const cacheDirectory = path.resolve(options.cache); // Отримуємо абсолютний шлях до кешу

console.log(`Host: ${options.host}`);
console.log(`Port: ${options.port}`);
console.log(`Cache Directory: ${cacheDirectory}`);

// Перевіряємо наявність обов'язкових параметрів
if (!options.host || !options.port || !options.cache) {
  console.error('Усі параметри --host, --port і --cache є обовʼязковими.');
  process.exit(1); // Виходимо з програми, якщо параметри не задані
}

// Створюємо HTTP сервер
const server = http.createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Привіт! Це кешуючий проксі-сервер.\n');
});


// Запускаємо сервер
server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
