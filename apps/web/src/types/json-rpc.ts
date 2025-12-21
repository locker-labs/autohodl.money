export interface IJsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: (string | number | boolean)[];
  id: number;
}

export interface IJsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}
