# Мини-демо ExternalToolset (React + FastAPI)

## Запуск backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn server:app --reload
```

## Запуск frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Откройте браузер на http://localhost:5173

## Как это работает

Проект показывает сценарий "deferred tool call": агент не имеет доступа к файловой системе
и пользовательскому интерфейсу, поэтому просит фронтенд выполнить действие.

Ключевые шаги:
1. Пользователь запускает действие в чате (кнопка "Запустить инструмент").
2. Фронтенд формирует запрос инструмента (`pickFile`) и отправляет его на backend
   через `POST /request_tool/`.
3. Фронтенд открывает системный диалог выбора файла через безопасный API браузера.
4. Результат (имя/размер или ошибка) отправляется на backend через
   `POST /tool_result/`.
5. Агент опрашивает `GET /tool_result/{call_id}` и получает результат.

Это демонстрирует, как LLM/агент может безопасно использовать внешние инструменты,
не имея прямого доступа к UI и локальным файлам пользователя.