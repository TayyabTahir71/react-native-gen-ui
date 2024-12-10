import { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources';
import z from 'zod';
import { OpenAIApi } from './openai-api';
import { ReactElement } from 'react';
export type ChatCompletionMessageOrReactElement = ReactElement | ChatCompletionMessageParam;
export interface Tool<Z extends z.Schema> {
    description: string;
    parameters: Z;
    render: (args: z.infer<Z>) => ToolRenderReturnType;
}
export type ValidatorsObject = {
    [name: string]: z.Schema;
};
export type Tools<V extends ValidatorsObject = {}> = {
    [name in keyof V]: Tool<V[name]>;
};
export type ChatCompletionCreateParams = Omit<ChatCompletionCreateParamsStreaming, 'tools'> & {
    tools?: Tools<{
        [toolName: string]: z.Schema;
    }>;
};
type ToolGeneratorReturn = {
    component: ReactElement;
    data: object;
};
export type ToolRenderReturnType = AsyncGenerator<ReactElement, ToolGeneratorReturn, unknown> | ToolGeneratorReturn;
export interface ChatCompletionCallbacks {
    onChunkReceived?: (messages: ChatCompletionMessageOrReactElement[]) => void;
    onDone?: (messages: ChatCompletionMessageOrReactElement[]) => void;
    onError?: (error: Error) => void;
}
export declare class ChatCompletion {
    private eventSource;
    private api;
    private callbacks;
    private params;
    private newMessage;
    private newToolCall;
    private toolCallResult;
    private toolRenderResult;
    private finished;
    constructor(api: OpenAIApi, params: ChatCompletionCreateParams, callbacks: ChatCompletionCallbacks);
    start(): void;
    private handleNewChunk;
    serializeParams(): string;
    private notifyChunksReceived;
    private getMessages;
    private handleToolCall;
    private streamRecursiveAfterToolCall;
}
export {};
