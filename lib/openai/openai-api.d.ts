import { ChatCompletion, ChatCompletionCallbacks, ChatCompletionCreateParams } from './chat-completion';
export declare class OpenAIApi {
    apiKey: string;
    basePath: string;
    constructor({ apiKey, basePath }: {
        apiKey: string;
        basePath?: string;
    });
    createChatCompletion(params: ChatCompletionCreateParams, callbacks: ChatCompletionCallbacks): Promise<ChatCompletion>;
}
