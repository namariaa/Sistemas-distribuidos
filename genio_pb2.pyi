from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class CumprimentarRequest(_message.Message):
    __slots__ = ("nome",)
    NOME_FIELD_NUMBER: _ClassVar[int]
    nome: str
    def __init__(self, nome: _Optional[str] = ...) -> None: ...

class CumprimentarReply(_message.Message):
    __slots__ = ("mensagem",)
    MENSAGEM_FIELD_NUMBER: _ClassVar[int]
    mensagem: str
    def __init__(self, mensagem: _Optional[str] = ...) -> None: ...
