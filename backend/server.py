from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

deferred_calls = {}
tool_results = {}

class ToolCall(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any]

class ToolResult(BaseModel):
    call_id: str
    result: Dict[str, Any]
    error: Optional[str] = None

@app.post("/request_tool/")
def request_tool(call: ToolCall):
    deferred_calls[call.id] = call
    return {"status": "ok", "call": call.dict()}

@app.post("/tool_result/")
def tool_result(payload: ToolResult):
    if payload.call_id not in deferred_calls:
        return {"error": "Call not found"}
    call = deferred_calls.pop(payload.call_id)
    tool_results[payload.call_id] = payload.dict()
    print(
        f"Agent получил результат {payload.result} "
        f"для инструмента {call.name}"
    )
    if payload.error:
        print(f"Ошибка инструмента: {payload.error}")
    return {"status": "processed", "call_id": payload.call_id}

@app.get("/tool_result/{call_id}")
def get_tool_result(call_id: str):
    if call_id not in tool_results:
        return {"status": "pending"}
    return tool_results.pop(call_id)