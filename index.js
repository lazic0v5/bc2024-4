const { Command } = require('commander');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent'); // Імпортуємо superagent

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

program.parse(process.argv);
const options = program.opts();
const cacheDirectory = path.resolve(options.cache);

// Функція для отримання шляху до файлу в кеші
const getCachedFilePath = (code) => path.join(cacheDirectory, `${code}.jpg`);

// Обробка запитів
const server = http.createServer(async (req, res) => {
  const statusCode = req.url.slice(1); // Отримуємо HTTP код зі шляху
  const cachePath = getCachedFilePath(statusCode); // Шлях до файлу в кеші

  if (req.method === 'GET') {
    // Перевіряємо, чи файл є у кеші
    try {
      const image = await fs.readFile(cachePath); // Читаємо файл з кешу
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(image);
    } catch (err) {
      // Якщо файлу немає в кеші, робимо запит на http.cat
      try {
        const response = await superagent.get(`https://http.cat/${statusCode}`); // Отримуємо картинку
        await fs.writeFile(cachePath, response.body); // Зберігаємо картинку у кеш
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(response.body);
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Картинка не знайдена на http.cat.\n');
      }
    }
  } else if (req.method === 'PUT') {
    // Збереження нового файлу у кеші
    let imageData = [];

    req.on('data', (chunk) => {
      imageData.push(chunk);
    });

    req.on('end', async () => {
      const buffer = Buffer.concat(imageData);
      await fs.writeFile(cachePath, buffer); // Записуємо файл у кеш
      res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Картинку збережено у кеші.\n');
    });
  } else if (req.method === 'DELETE') {
    // Видалення файлу з кешу
    try {
      await fs.unlink(cachePath); // Видаляємо файл
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Картинку видалено з кешу.\n');
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Картинку не знайдено для видалення.\n');
    }
  } else {
    // Метод не підтримується
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Метод не дозволено.\n');
  }
});

// Запуск сервера
server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});

