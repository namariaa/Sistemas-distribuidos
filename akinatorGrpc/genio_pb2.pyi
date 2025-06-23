from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class GenioRequest(_message.Message):
    __slots__ = ("resposta",)
    RESPOSTA_FIELD_NUMBER: _ClassVar[int]
    resposta: str
    def __init__(self, resposta: _Optional[str] = ...) -> None: ...

class GenioReply(_message.Message):
    __slots__ = ("mensagem", "fim_jogo", "personagem", "descricao", "foto")
    MENSAGEM_FIELD_NUMBER: _ClassVar[int]
    FIM_JOGO_FIELD_NUMBER: _ClassVar[int]
    PERSONAGEM_FIELD_NUMBER: _ClassVar[int]
    DESCRICAO_FIELD_NUMBER: _ClassVar[int]
    FOTO_FIELD_NUMBER: _ClassVar[int]
    mensagem: str
    fim_jogo: bool
    personagem: str
    descricao: str
    foto: str
    def __init__(self, mensagem: _Optional[str] = ..., fim_jogo: bool = ..., personagem: _Optional[str] = ..., descricao: _Optional[str] = ..., foto: _Optional[str] = ...) -> None: ...
