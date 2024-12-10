import { ChatCompletionCallbacks, ChatCompletionCreateParams } from './chat-completion';
export type OpenAIApiParams = {
    apiKey: string;
    model: string;
    basePath?: string;
};
export declare class OpenAI {
    private api;
    private model;
    constructor({ apiKey, model, basePath }: OpenAIApiParams);
    private getApi;
    createChatCompletion(params: Omit<ChatCompletionCreateParams, 'model' | 'temperature' | 'stream'>, callbacks: ChatCompletionCallbacks): Promise<import("./chat-completion").ChatCompletion>;
}
