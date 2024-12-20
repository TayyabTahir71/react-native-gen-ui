import React from 'react';
import { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources';
import { ChatCompletionMessageOrReactElement, Tools, ValidatorsObject } from '../openai/chat-completion';
import { OpenAI } from '../openai/openai';
interface UseChatParams<V extends ValidatorsObject = {}> {
    openAi: OpenAI;
    initialMessages?: ChatCompletionMessageParam[];
    onSuccess?: (messages: ChatCompletionMessageOrReactElement[]) => void;
    onError?: (error: Error) => void;
    tools?: Tools<V>;
}
interface UseChatResponse {
    input: string;
    messages: ChatCompletionMessageOrReactElement[];
    error: Error | undefined;
    isLoading: boolean;
    isStreaming: boolean;
    onInputChange: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (msg: string | ChatCompletionContentPart[]) => Promise<void>;
    setConversation: (conversation: ChatCompletionMessageOrReactElement[]) => void;
    handleStop: () => void;
}
declare const useChat: <V extends ValidatorsObject = {}>(params: UseChatParams<V>) => UseChatResponse;
export { useChat };
