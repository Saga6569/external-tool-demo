# Backend (FastAPI) для ExternalToolset Demo

## Запуск
1. Установите зависимости:
   pip install -r requirements.txt
2. Запустите сервер:
   uvicorn server:app --reload

## Как работает backend

Backend — координатор deferred tool calls. Он принимает запросы инструментов,
хранит их в памяти и принимает результаты от фронтенда.

Основные компоненты:
- `ToolCall` (`server.py`) — схема запроса инструмента: `id`, `name`, `arguments`.
- `ToolResult` (`server.py`) — схема результата: `call_id`, `result`, `error`.
- `deferred_calls` — in-memory хранилище запросов инструментов.
- `tool_results` — in-memory хранилище результатов.

Эндпоинты:
- `POST /request_tool/` — принимает deferred call и сохраняет его в `deferred_calls`.
- `POST /tool_result/` — принимает результат и сохраняет его в `tool_results`.
- `GET /tool_result/{call_id}` — возвращает результат, если готов, иначе `status: pending`.

Важно: хранение в памяти сделано для простоты демо. В реальном сценарии
результаты и запросы лучше хранить в БД/кеше (например, Redis).

