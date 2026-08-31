from __future__ import annotations

from typing import Any

from app.llm.client import LLMClient

from app.agent.tools import CrowTools
from app.llm.prompts import CROW_SYSTEM_PROMPT


class CrowOrchestrator:
    """
    Central orchestration layer for Crow AI.

    Responsibilities:
    - Send conversation context to the LLM
    - Allow the LLM to call Crow tools
    - Execute requested tools
    - Continue the conversation after tool execution
    - Return the final AI response

    Business logic such as note access, coin deduction,
    and database operations must remain inside services/tools.
    """

    def __init__(
        self,
        client: LLMClient,
        tools: CrowTools,
    ) -> None:
        self.client = client
        self.tools = tools

    async def run(
        self,
        messages: list[dict[str, Any]],
    ) -> str:
        """
        Run one Crow conversation turn.

        `messages` should contain the existing conversation history
        followed by the latest user message.
        """

        conversation = [
            {
                "role": "system",
                "content": CROW_SYSTEM_PROMPT,
            },
            *messages,
        ]

        while True:
            response = await self.client.chat(
                messages=conversation,
                tools=self.tools.definitions(),
            )

            message = response.choices[0].message

            # No tool call -> final Crow response
            if not message.tool_calls:
                return message.content or ""

            # Add assistant tool-call message to conversation
            conversation.append(
                {
                    "role": "assistant",
                    "content": message.content,
                    "tool_calls": [
                        {
                            "id": tool_call.id,
                            "type": "function",
                            "function": {
                                "name": tool_call.function.name,
                                "arguments": tool_call.function.arguments,
                            },
                        }
                        for tool_call in message.tool_calls
                    ],
                }
            )

            # Execute every requested tool
            for tool_call in message.tool_calls:
                result = await self.tools.execute(
                    name=tool_call.function.name,
                    arguments=tool_call.function.arguments,
                )

                conversation.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result,
                    }
                )