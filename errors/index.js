class SocketClientNotReady extends Error {} // { constructor(...args) { super(...args) } }
class SendPkgNotReady extends Error {}
class SendRequestPkgFails extends Error {}
class ResponseHeaderRecvFails extends Error {}
class ResponseRecvFails extends Error {}
class MethodNotImplemented extends Error {}

module.exports = {
  SocketClientNotReady,
  SendPkgNotReady,
  SendRequestPkgFails,
  ResponseHeaderRecvFails,
  ResponseRecvFails,
  MethodNotImplemented,
};