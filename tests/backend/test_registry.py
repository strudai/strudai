import pytest
from pydantic import BaseModel, ValidationError

from backend.tools.registry import ToolDef, ToolRegistry


class DummyParams(BaseModel):
    value: str


@pytest.fixture
def reg():
    return ToolRegistry()


class TestToolRegistration:
    def test_register_tool_no_params(self, reg):
        @reg.tool(name="ping", description="A ping tool")
        async def ping():
            return {"pong": True}

        assert "ping" in reg._tools
        assert reg._tools["ping"].name == "ping"
        assert reg._tools["ping"].description == "A ping tool"
        assert reg._tools["ping"].params_model is None

    def test_register_tool_with_params(self, reg):
        @reg.tool(name="echo", description="Echo back", params_model=DummyParams)
        async def echo(params: DummyParams):
            return {"echoed": params.value}

        assert reg._tools["echo"].params_model is DummyParams

    def test_decorator_returns_original_function(self, reg):
        @reg.tool(name="fn", description="test")
        async def my_fn():
            return {}

        assert my_fn.__name__ == "my_fn"


class TestToolExecution:
    @pytest.mark.asyncio
    async def test_execute_no_params(self, reg):
        @reg.tool(name="ping", description="ping")
        async def ping():
            return {"pong": True}

        result = await reg.execute("ping")
        assert result == {"pong": True}

    @pytest.mark.asyncio
    async def test_execute_with_params(self, reg):
        @reg.tool(name="echo", description="echo", params_model=DummyParams)
        async def echo(params: DummyParams):
            return {"echoed": params.value}

        result = await reg.execute("echo", {"value": "hello"})
        assert result == {"echoed": "hello"}

    @pytest.mark.asyncio
    async def test_execute_unknown_tool_raises(self, reg):
        with pytest.raises(KeyError, match="Unknown tool: nope"):
            await reg.execute("nope")

    @pytest.mark.asyncio
    async def test_execute_with_invalid_params_raises(self, reg):
        @reg.tool(name="echo", description="echo", params_model=DummyParams)
        async def echo(params: DummyParams):
            return {"echoed": params.value}

        with pytest.raises(ValidationError):
            await reg.execute("echo", {"wrong_field": "x"})

    @pytest.mark.asyncio
    async def test_execute_params_model_with_none_params_calls_without_args(self, reg):
        """When params_model is set but params=None, handler is called without args."""
        @reg.tool(name="t", description="t", params_model=DummyParams)
        async def handler():
            return {"ok": True}

        result = await reg.execute("t", None)
        assert result == {"ok": True}


class TestSchemaExport:
    def test_to_schemas_no_params(self, reg):
        @reg.tool(name="ping", description="A ping tool")
        async def ping():
            return {}

        schemas = reg.to_schemas()
        assert len(schemas) == 1
        assert schemas[0]["name"] == "ping"
        assert schemas[0]["description"] == "A ping tool"
        assert schemas[0]["parameters"] == {"type": "object", "properties": {}}

    def test_to_schemas_with_params(self, reg):
        @reg.tool(name="echo", description="Echo", params_model=DummyParams)
        async def echo(params: DummyParams):
            return {}

        schemas = reg.to_schemas()
        assert len(schemas) == 1
        assert "properties" in schemas[0]["parameters"]
        assert "value" in schemas[0]["parameters"]["properties"]

    def test_to_schemas_multiple_tools(self, reg):
        @reg.tool(name="a", description="tool a")
        async def a():
            return {}

        @reg.tool(name="b", description="tool b")
        async def b():
            return {}

        schemas = reg.to_schemas()
        assert len(schemas) == 2
        names = {s["name"] for s in schemas}
        assert names == {"a", "b"}
